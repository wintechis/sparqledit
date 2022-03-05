/**
 * SPARQL_edit algorithm
 * @param {import("sparqljs").SparqlQuery} queryObject parsed JS object of the original SPARQL Select query
 * @param {import("fetch-sparql-endpoint").IBindings & {include: boolean, valueNew?: string}} bindingsRow the row of all ResultBindungs that contains the edited variable value
 * @param {boolean} insertOnly flag for building an insert query
 * @returns {import("sparqljs").SparqlQuery} JS object of the created SPARQL Update query
 */
export function buildUpdateQueryObject(queryObject, bindingsRow, insertOnly) {

  // 0. clone original query object
  const modQuery = JSON.parse(JSON.stringify(queryObject));


  // 1. find bgp line containing the edited variable (literal object)
  let editedVar;
  let editedVarBgpTripleRef;

  // 1.1 find edited variable
  // iterate over query result's variables
  Object.keys(bindingsRow).forEach(variable => {
    if (bindingsRow[variable].valueNew !== undefined) {
      // save the name and new/edited value
      editedVar = {
        name: variable,
        datatype: bindingsRow[variable].datatype, // NamedNode
        language: bindingsRow[variable].language, // lang string, e.g. 'en'
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
    .filter(patternsObj => patternsObj.type === 'bgp')
    .flatMap(bgpObj => bgpObj.triples);
  // iterate over bgp triples and compare variable names
  bgpTriples.concat(optTriples)
    .filter(triple => triple['object'].termType === 'Variable')
    .forEach(varTriple => {   
      if (varTriple['object'].value === editedVar.name) { // name match
        editedVarBgpTripleRef = varTriple; // save the bgp triple reference
      }
    });
  
  // 1.3 check if edited/inserted variable in optional bgp
  //let editedOptionalRef;
  let editedOptionalTriples;
  modQuery.where
    .filter(whereObj => whereObj.type === 'optional')
    .forEach(whereObj => {
      const triples = whereObj.patterns
        .filter(patternsObj => patternsObj.type === 'bgp')
        .flatMap(bgpObj => bgpObj.triples);
      const foundMatch = triples
        .map(triple => triple['object'])
        .filter(tripleObj => tripleObj.termType === 'Variable')
        .some(tripleObj => tripleObj.value === editedVar.name);
      if (foundMatch) {
        editedOptionalTriples = triples;
        //editedOptionalRef = whereObj;
      }
    });
  // if NOT insert mode: copy optional bgp as normal bgp to query's where array
  if (!insertOnly && editedOptionalTriples) {
    modQuery.where.push({
      type: 'bgp',
      triples: editedOptionalTriples
    });
  }

  // 2. replace all (named) variables in bgp triples with NamedNodes or Literals from query results 
  for (let i = modQuery.where.length - 1; i >= 0; i--) {
    let whereElement = modQuery.where[i];
    // BGP
    if (whereElement.type === 'bgp') {
      // replace all (named) variables
      replaceAllNamedVariables(whereElement.triples, bindingsRow);
    }
    // OPTIONAL, FILTER, ...
    else {
      modQuery.where.splice(i, 1); // remove unnecessary and unsupported where elements, e.g. filter 
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
                if (!sparqlResultBindings[variable].insertMode) { // dont replace with default values added for insert mode
                  bgpline[spo] = sparqlResultBindings[variable];
                }
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
  updateQueryObject.updates[0].where = 
    modQuery.where.filter(whereObj => whereObj.type === 'bgp');

  // 3.3 construct 'insert' and 'delete part'
  if (insertOnly) {
    // insert missing value
    let insertTriplesCopy = JSON.parse(JSON.stringify(editedOptionalTriples));
    insertTriplesCopy.forEach(triple => {
      // insert new value
      const tripleObj = triple['object'];
      if (tripleObj.termType === 'Variable' && tripleObj.value === editedVar.name) {
        tripleObj.termType = 'Literal';
        tripleObj.value = editedVar.valueNew;
        tripleObj.datatype = editedVar.datatype;
        tripleObj.language = editedVar.language;
      }
      // variable -> value
      for (const spo of ['subject', 'predicate', 'object']) {
        if (triple[spo].termType === 'Variable') {
          // iterate over variables list
          Object.keys(bindingsRow).forEach(variable => {
            if (triple[spo].value === variable) {
              // match -> replace with cell value from query (from bindingsRow)
              const rdfType = bindingsRow[variable].termType;
              if (rdfType === 'NamedNode' || rdfType === 'Literal') {
                if (!bindingsRow[variable].insertMode) { // dont replace with default values added for insert mode
                  triple[spo] = bindingsRow[variable];
                }
              }
            }
          });
          // if still variable = no value found in bindingRow -> set to blankNode
          if (triple[spo].termType === 'Variable') { 
            triple[spo].termType = 'BlankNode';
          }
        }
      }
    });
    updateQueryObject.updates[0].insert.push({
      type: 'bgp',
      triples: insertTriplesCopy
    });
  } else {
    // normal value update
    updateQueryObject.updates[0].delete.push({
      type: 'bgp',
      triples: [editedVarBgpTripleRef]
    });    
    let insertCopy = JSON.parse(JSON.stringify(editedVarBgpTripleRef));
    insertCopy.object.termType = 'Literal';
    insertCopy.object.value = editedVar.valueNew;
    insertCopy.object.datatype = editedVar.datatype;
    updateQueryObject.updates[0].insert.push({
      type: 'bgp',
      triples: [insertCopy]
    });
  }

  // 3.4 copy default graph name
  if (modQuery?.from?.default[0]) { // if FROM present
    // copy to 'graph' property in update query obj
    updateQueryObject.updates[0].graph = modQuery.from.default[0];
  }

  //console.dir(updateQueryObject, { depth: null })
  return updateQueryObject;
}