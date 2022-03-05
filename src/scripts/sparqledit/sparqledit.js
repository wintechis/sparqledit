import SparqlClient from './SparqlClient';
import { buildUpdateQueryObject } from './sparqleditalgorithm';
import { Parser as SparqlParser } from 'sparqljs';
import { Generator as SparqlGenerator } from 'sparqljs';
import { Wildcard } from 'sparqljs';

export async function executeSelectOrUpdateQuery(querySubmission) {
  const sparqlClient = new SparqlClient(querySubmission.credentials);

  // TODO
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

export function buildUpdateQueryForVariable(queryStr, variableRow, insertOnly) {
  // parse query string into JS object
  const queryObj = buildQueryObject(queryStr);

  // SPARQLedit algorithm for creating a SPARQL update query object
  const updateQueryObj = buildUpdateQueryObject(queryObj, variableRow, insertOnly);

  // return query string from JS query object
  const updateQuery = stringifyQueryObject(updateQueryObj);
  return updateQuery;
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
