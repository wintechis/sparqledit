import sparqlClient from '../scripts/sparqlclient';
import { Parser as SparqlParser } from 'sparqljs';
import { Generator as SparqlGenerator } from 'sparqljs';
import { Wildcard } from 'sparqljs';

export async function executeSelectOrUpdateQuery(querySubmission) {
  const queryType = sparqlClient.getQueryType(querySubmission.queryString);
  if (queryType === 'SELECT') {
    return executeSelectQuery(querySubmission.endpointQuery, querySubmission.queryString);
  } else {
    return sparqlClient.submitUpdateQuery(querySubmission.endpointUpdate, querySubmission.queryString);
  }
}

export async function executeSelectQuery(sparqlUrl, queryStr) {
  // parse query string into JS object
  const queryObj = buildQueryObject(queryStr);

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
    sparqlUrl, stringifyQueryObject(queryObj));
  
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

export function buildUpdateQueryForVariable(queryStr, variableRow) {
  // parse query string into JS object
  const queryObj = buildQueryObject(queryStr);

  // SPARQLedit algorithm for creating a SPARQL update query object
  const updateQueryObj = buildUpdateQueryObject(queryObj, variableRow);

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

// SPARQLedit algorithm
function buildUpdateQueryObject(queryObject, bindingsRow) {

  // 0. clone original query object
  const modQuery = JSON.parse(JSON.stringify(queryObject));


  // 1. find bgp line containing the edited variable (literal object)
  let editedVar;
  let editedVarBgpTriple;

  // 1.1 find edited variable
  // iterate over query result's variables
  Object.keys(bindingsRow).forEach(variable => {
    if (bindingsRow[variable].valueNew !== undefined) {
      // save the name and new/edited value
      editedVar = {
        name: variable,
        valueNew: bindingsRow[variable].valueNew
      };
      delete bindingsRow[variable].valueNew; // optional: remove to prevent later confusion
    }
  });
  if (editedVar === 'undefined') {
    throw new Error('No edited variable found.');    
  }

  // 1.2 collect bgp triples and find bgp triple with edited variable
  const bgpTriples = modQuery.where
    .filter(whereObj => whereObj.type === 'bgp')
    .flatMap(bgpObj => bgpObj.triples);
  const optTriples = modQuery.where
    .filter(whereObj => whereObj.type === 'optional')
    .flatMap(optObj => optObj.patterns)
    .flatMap(bgpObj => bgpObj.triples);
  // iterate over bgp triples and compare variable names
  bgpTriples.concat(optTriples)
    .filter(triple => triple['object'].termType === 'Variable')
    .forEach(varTriple => {   
      if (varTriple['object'].value === editedVar.name) { // name match
        editedVarBgpTriple = varTriple; // save the bgp triple reference
      }
    });


  // 2. replace all (named) variables in bgp triples with NamedNodes or Literals from query results 
  for (let i = modQuery.where.length - 1; i >= 0; i--) {
    let whereElement = modQuery.where[i];
    // BGP
    if (whereElement.type === 'bgp') {
      // replace all (named) variables
      replaceAllNamedVariables(whereElement.triples, bindingsRow);
    }
    // OPTIONAL
    else if (whereElement.type === 'optional') {
      // replace all (named) variables
      // only first sub-level; TODO: nested OPTIONAL
      replaceAllNamedVariables(whereElement.patterns[0].triples, bindingsRow);
    } 
    // FILTER, ...
    else {
      modQuery.where.splice(i, 1); // remove unsupported where elements, e.g. filter 
    }
  }
  //console.dir(modQuery, { depth: null })

  function replaceAllNamedVariables(bgpTriples, sparqlResultBindings) {
    // replace all (named) variables with literal + value in bgp
    for (const bgpline of bgpTriples) {
      // replace subjects, predicates and objects
      for (const spo of ['subject', 'predicate', 'object']) {
        if (bgpline[spo].termType === 'Variable') {
          // iterate over variables list
          Object.keys(sparqlResultBindings).forEach(variable => {
            if (bgpline[spo].value === variable) {
              // match -> replace with cell value from query (from bindingsRow)
              const rdfType = sparqlResultBindings[variable].termType;
              if (rdfType === 'NamedNode' || rdfType === 'Literal') {
                bgpline[spo] = sparqlResultBindings[variable];
              }
            }
          });
        }
        // blank node -> replace with named variable
        if (bgpline[spo].termType === 'BlankNode') {
          bgpline[spo].termType = 'Variable';
        }
      }
    }
  }

  // 3. build update query object
  const updateQueryObject = {
    type: 'update',
    updates: [{
      updateType: 'insertdelete',
      delete: [],
      insert: [],
      where: []
    }]
  };

  // 3.1 copy prefixes
  updateQueryObject.prefixes = modQuery.prefixes;

  // 3.2 copy modified 'where' part
  updateQueryObject.updates[0].where = modQuery.where; // only bgp, no filter

  // 3.3 construct 'insert' and 'delete part'
  updateQueryObject.updates[0].delete.push({
    type: 'bgp',
    triples: [editedVarBgpTriple]
  });
  let insertCopy = JSON.parse(JSON.stringify(editedVarBgpTriple));
  insertCopy.object.value = editedVar.valueNew;
  updateQueryObject.updates[0].insert.push({
    type: 'bgp',
    triples: [insertCopy]
  });

  // 3.4 copy default graph name
  if (modQuery?.from?.default[0]) { // if FROM present
    // copy to 'graph' property in update query obj
    updateQueryObject.updates[0].graph = modQuery.from.default[0];
  }

  //console.dir(updateQueryObject, { depth: null })
  return updateQueryObject;
}