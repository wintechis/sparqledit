import SparqlClient from './SparqlClient';
import { buildUpdateQueryObject, buildUpdateCheckQueryObject } from 'sparqledit-algorithm';
import { Parser as SparqlParser } from 'sparqljs';
import { Generator as SparqlGenerator } from 'sparqljs';
import { Wildcard } from 'sparqljs';
import { toISODateWithTimezone } from '../utilities';
import { RDF_NAMESPACES } from '../models/RdfNamespaces';
import { DataFactory, Store } from 'n3';

export async function executeSelectOrUpdateQuery(querySubmission) {
  const sparqlClient = new SparqlClient(querySubmission.credentials);

  const queryType = sparqlClient.getQueryType(querySubmission.queryString);
  if (queryType === 'SELECT') {
    return executeSelectWildcardQuery(sparqlClient, querySubmission);
  } else {
    return sparqlClient.submitUpdateQuery(querySubmission.endpointUpdate, querySubmission.queryString);
  }
}

async function executeSelectWildcardQuery(sparqlClient, querySubmission) {
  // parse query string into JS object
  const queryObj = buildQueryObject(querySubmission.queryString);

  // check SPARQL SELECT variables
  const isWildcardVars = queryObj.variables[0] instanceof Wildcard;
  // save original variable names
  const origVars = queryObj.variables.map(varObj => varObj.value); 
  // if not already, replace selected variables with wildcard
  if (!isWildcardVars) {
    queryObj.variables = [ new Wildcard() ]; // wildcard
  }
  
  // execute wildcard query
  const sparql_results = await sparqlClient.submitQuery(
    querySubmission.endpointQuery, stringifyQueryObject(queryObj));
  
  // mark variables not included in original query
  sparql_results.forEach(bindingsRow => {
    // for each variable binding (=column)
    for (const [variable,binding] of Object.entries(bindingsRow)) {
      if(origVars.includes(variable) || isWildcardVars === true) {
        binding.include = true;
      } else {
        binding.include = false;
      }
    }
  });

  return sparql_results;
}

export function buildCheckQueryForVariable(queryStr, variableRow) {
  // parse query string into JS object
  const queryObj = buildQueryObject(queryStr);

  // SPARQLedit algorithm for creating a SPARQL update query object
  const checkQueryObj = buildUpdateCheckQueryObject(queryObj, variableRow);

  // return query string from JS query object
  const checkQuery = stringifyQueryObject(checkQueryObj);
  return checkQuery;
}

export function buildUpdateQueryForVariable(queryStr, variableRow) {
  // parse query string into JS object
  const queryObj = buildQueryObject(queryStr);

  // SPARQLedit algorithm for creating a SPARQL update query object
  const updateQueryObj = buildUpdateQueryObject(queryObj, variableRow);

  // return query string from JS query object
  const updateQuery = stringifyQueryObject(updateQueryObj);
  return updateQuery;
}

export function buildUpdateLogQueryForVariable(queryStr, variableRow, sparqlView) {
  // parse query string into JS object
  const queryObj = buildQueryObject(queryStr);

  // SPARQLedit algorithm for creating a SPARQL update query object
  const updateQueryObj = buildUpdateQueryObject(queryObj, variableRow);

  // add log components (prefixes, graph part, time bind) to query
  addUpdateLogComponentsToUpdateQuery(updateQueryObj, sparqlView.updateLogGraph);
  console.log(updateQueryObj);

  // return query string from JS query object
  const updateLogQueryStr = stringifyQueryObject(updateQueryObj);
  return updateLogQueryStr;
}

export function buildQueryObject(queryStr) {
  // init parser and parse query string to JS object
  const parser = new SparqlParser();
  const queryObject = parser.parse(queryStr);
  //console.dir(queryObject, { depth: null });
  return queryObject;
}

function stringifyQueryObject(queryObject) {
  // generate SPARQL query string from object
  const generator = new SparqlGenerator();
  let generatedQuery = generator.stringify(queryObject);
  return generatedQuery;
}

function addUpdateLogComponentsToUpdateQuery( updateQueryObj, updateLogGraphName ) {
  // query string from original JS query object
  const updateQueryStr = stringifyQueryObject(updateQueryObj);

  // 1. add prefixes
  updateQueryObj.prefixes.rdf = RDF_NAMESPACES.rdf;
  updateQueryObj.prefixes.rdfs = RDF_NAMESPACES.rdfs;
  updateQueryObj.prefixes.xsd = RDF_NAMESPACES.xsd;
  updateQueryObj.prefixes.prov = RDF_NAMESPACES.prov;
  updateQueryObj.prefixes.spedit = RDF_NAMESPACES.spedit;

  // 2. add GRAPH part for update log triples
  const insertGraphBlock = {
    type: 'graph',
    triples: [],
    name: {
      termType: 'NamedNode',
      value: updateLogGraphName || 'http://example.org/graph/updatelog'
    }
  };

  const { quad, namedNode, literal, variable } = DataFactory;
  const store = new Store();

  const provActivityBN = store.createBlankNode( 'updateActivity' );
  const provEntityBN = store.createBlankNode( 'updateQuery' );

  const updateStartDateISO = toISODateWithTimezone( new Date() );
  const timeVariableName = 'SPARQLedit_UpdateExecutionTime';

  store.addQuads( [
    quad(
      provActivityBN,
      namedNode( RDF_NAMESPACES.rdf + 'type' ),
      namedNode( RDF_NAMESPACES.prov + 'Activity' )
    ),
    quad(
      provActivityBN,
      namedNode( RDF_NAMESPACES.prov + 'used' ),
      provEntityBN
    ),
    quad(
      provActivityBN,
      namedNode( RDF_NAMESPACES.prov + 'wasAssociatedWith' ),
      namedNode( 'http://iis.fraunhofer.de/sparqledit/app' )
    ),
    quad(
      provActivityBN,
      namedNode( RDF_NAMESPACES.prov + 'startedAtTime' ),
      literal( updateStartDateISO, namedNode( RDF_NAMESPACES.xsd + 'dateTime' ) )
    ),
    quad(
      provActivityBN,
      namedNode( RDF_NAMESPACES.prov + 'endedAtTime' ),
      variable( timeVariableName )
    ),
    quad(
      provEntityBN,
      namedNode( RDF_NAMESPACES.rdf + 'type' ),
      namedNode( RDF_NAMESPACES.prov + 'Entity' )
    ),
    quad(
      provEntityBN,
      namedNode( RDF_NAMESPACES.prov + 'generatedAtTime' ),
      literal( updateStartDateISO, namedNode( RDF_NAMESPACES.xsd + 'dateTime' ) )
    ),
    quad(
      provEntityBN,
      namedNode( RDF_NAMESPACES.spedit + 'updateQuery' ),
      literal( updateQueryStr )
    )
  ] );
  // add triple patterns to the update query obj
  insertGraphBlock.triples.push( store.getQuads() );
  updateQueryObj.updates[ 0 ].insert.push( insertGraphBlock );

  // 3. add BIND statement for the update time
  const whereBindStatement = {
    type: "bind",
    variable: {
      termType: "Variable",
      value: timeVariableName
    },
    expression: {
      type: "operation",
      operator: "now",
      args: []
    }
  };
  updateQueryObj.updates[0].where.push(whereBindStatement);
}