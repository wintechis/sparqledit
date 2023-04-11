import * as RDF from "@rdfjs/types";
import * as SparqlJS from 'sparqljs';
import { 
  SparqlEditResultBindings, 
  EditedVariableInfo, 
  SubjectType, 
  PredicateType 
} from './types';

/**
 * SPARQL_edit algorithm
 * @param selectQueryObject parsed JS object of the original SPARQL Select query
 * @param sparqlEditResultRow the row of all ResultBindungs that contains the edited variable value; extended with information for SPARQL_edit
 * @returns JS object of the created SPARQL Update query
 */
export function buildUpdateQueryObject(selectQueryObject: SparqlJS.SelectQuery, sparqlEditResultRow: SparqlEditResultBindings): SparqlJS.Update {
  
  // 0. clone original query object
  const modQuery: SparqlJS.SelectQuery = JSON.parse(JSON.stringify(selectQueryObject));
  if (modQuery.where === undefined) {
    throw new Error("missing 'WHERE' block");
  }

  // 1. analyse edited variable
  // 1.1 collect information about the edited literal (= variable in query)
  const editedVar = findEditedVariableInResultRow(sparqlEditResultRow);
  // 1.2 collect BGP triples and find triple with edited variable
  const editedVarBgpTripleRef = findEditedVariableBgpTriple(modQuery, editedVar);
  // 1.3 check if edited/inserted variable in BGP of an optional block
  const editedOptionalTriples = findEditedVariableOptionalBgpTriples(modQuery, editedVar);
  // if NOT insert mode && optional var edited: copy optional bgp as normal bgp to query's where array
  if (editedVar.insertMode !== true && editedOptionalTriples) {
    const optBgpPattern: SparqlJS.BgpPattern = {
      type: 'bgp',
      triples: editedOptionalTriples
    };
    modQuery.where.push(optBgpPattern);
  }

  // 2. rebuild the query's where block 
  rebuildQueryWhereBlock(modQuery, sparqlEditResultRow);
  //console.dir(modQuery, { depth: null })

  // 3. build update query
  const updateQueryObject = buildUpdateQuery(modQuery, editedVar, sparqlEditResultRow, editedOptionalTriples, editedVarBgpTripleRef);
  //console.dir(updateQueryObject, { depth: null })

  return updateQueryObject;
}

// 1. analyse edited variable

function findEditedVariableInResultRow(sparqlEditResultRow: SparqlEditResultBindings): EditedVariableInfo {
  // iterate over query result's variables
  for (const variable of Object.keys(sparqlEditResultRow)) {
    const resultBinding = sparqlEditResultRow[variable];
    if (resultBinding.termType === "Literal" && resultBinding.valueNew !== undefined) {
      // save the name and new/edited value
      return {
        name: variable,
        datatype: resultBinding.datatype,
        language: resultBinding.language,
        valueNew: resultBinding.valueNew,
        insertMode: resultBinding.insertMode ? true : false
      };
    }
  }
  throw new Error('no edited variable found');    
}

function findEditedVariableBgpTriple(modQuery: SparqlJS.SelectQuery, editedVar: EditedVariableInfo) {
  if (modQuery.where === undefined) {
    throw new Error("missing 'WHERE' block");
  }

  const bgpTriples = modQuery.where
    .filter(isBgpPattern)
    .flatMap(bgpPattern => bgpPattern.triples);
  const optTriples = modQuery.where
    .filter(isOptionalPattern)
    .flatMap(optPattern => optPattern.patterns)
    .filter(isBgpPattern)
    .flatMap(bgpPattern => bgpPattern.triples);

  // iterate over bgp triples and compare variable names
  const allTriples = bgpTriples.concat(optTriples);
  const editedVarBgpTripleRef = allTriples
    .filter(triple => triple['object'].termType === 'Variable')
    .find(varTriple => varTriple['object'].value === editedVar.name); // name match

  if (!editedVarBgpTripleRef) {
    throw new Error('no BGP triple with edited variable found');    
  } else {
    return editedVarBgpTripleRef;
  }
}

function findEditedVariableOptionalBgpTriples(modQuery: SparqlJS.SelectQuery, editedVar: EditedVariableInfo) {
  if (modQuery.where === undefined) {
    throw new Error("missing 'WHERE' block");
  }

  let editedOptionalTriples: SparqlJS.Triple[] | null = null;

  const optPatterns = modQuery.where
    .filter(isOptionalPattern);
  for (const optPattern of optPatterns) {
    const triples = optPattern.patterns
      .filter(isBgpPattern)
      .flatMap(bgpPattern => bgpPattern.triples);
    const foundMatch = triples
      .map(triple => triple['object'])
      .filter(isVariableTerm)
      .some(variable => variable.value === editedVar.name);
    if (foundMatch) {
      editedOptionalTriples = triples;
    }
  }

  return editedOptionalTriples;
}

// 2. rebuild the query's where block 

function rebuildQueryWhereBlock(modQuery: SparqlJS.SelectQuery, sparqlEditResultRow: SparqlEditResultBindings) {
  if (modQuery.where === undefined) {
    throw new Error("missing 'WHERE' block");
  }

  for (let i = modQuery.where.length - 1; i >= 0; i--) {
    let pattern = modQuery.where[i];
    // case: BGP
    if (isBgpPattern(pattern)) {
      // 2.1 replace all (named) variables in bgp triples with NamedNodes or Literals from query results 
      replaceAllNamedVariables(pattern.triples, sparqlEditResultRow);
    }
    // case: OPTIONAL, FILTER, ...
    else {
      // 2.2 remove unnecessary and unsupported where elements, e.g. filter 
      modQuery.where.splice(i, 1);
    }
  }
}

function replaceAllNamedVariables(bgpTriples: SparqlJS.Triple[], sparqlResultBindings: SparqlEditResultBindings) {
  // replace all (named) variables with literal + value in bgp
  bgpTriples.forEach(triple => {
    // replace subject, predicate and object
    triple.subject = replaceSubjectVariable(triple.subject, sparqlResultBindings);
    triple.predicate = replacePredicateVariable(triple.predicate, sparqlResultBindings);
    triple.object = replaceObjectVariable(triple.object, sparqlResultBindings);
  });
}

function replaceSubjectVariable(subject: SubjectType, sparqlResultBindings: SparqlEditResultBindings): SubjectType {
  if (isVariableTerm(subject)) {
    const varName = subject.value;
    // iterate over variables list
    for (const resultVariable of Object.keys(sparqlResultBindings)) {
      if (varName === resultVariable) { // match: same variable
        // replace with cell value from result bindings
        const resultTerm = sparqlResultBindings[resultVariable];
        if (resultTerm.termType == 'NamedNode') {
          return resultTerm;
        }
      }
    }
  }
  // blank node -> replace with named variable
  if (isBlankNodeTerm(subject)) {
    return factoryCreateRDFVariable(subject.value);
  }
  // default
  return subject;
}

function replaceSubjectVariableInsertMode(subject: SubjectType, sparqlResultBindings: SparqlEditResultBindings): SubjectType {
  if (isVariableTerm(subject)) {
    const varName = subject.value;
    // iterate over variables list
    for (const resultVariable of Object.keys(sparqlResultBindings)) {
      if (varName === resultVariable) { // match: same variable
        // replace with cell value from result bindings
        const resultTerm = sparqlResultBindings[resultVariable];
        if (resultTerm.termType == 'NamedNode') {
          return resultTerm;
        }
      }
    }
    // if still variable = no value found in bindingRow -> set to blankNode
    if (isVariableTerm(subject)) { 
      return factory.blankNode(subject.value);
    }
  }
  // default
  return subject;
}

function replacePredicateVariable(predicate: PredicateType, sparqlResultBindings: SparqlEditResultBindings): PredicateType {
  if (!isPropertyPath(predicate) && isVariableTerm(predicate)) {
    const varName = predicate.value;
    // iterate over variables list
    for (const resultVariable of Object.keys(sparqlResultBindings)) {
      if (varName === resultVariable) { // match: same variable
        // replace with cell value from result bindings
        const resultTerm = sparqlResultBindings[resultVariable];
        if (resultTerm.termType == 'NamedNode') {             
          return resultTerm;
        }
      }
    }
  }
  // default
  return predicate;
}

function replaceObjectVariable(object: SparqlJS.Term, sparqlResultBindings: SparqlEditResultBindings): SparqlJS.Term {
  if (isVariableTerm(object)) {
    const varName = object.value;
    // iterate over variables list
    for (const resultVariable of Object.keys(sparqlResultBindings)) {
      if (varName === resultVariable) { // match: same variable
        // replace with cell value from result bindings
        const resultTerm = sparqlResultBindings[resultVariable];
        if (resultTerm.termType == 'NamedNode' ||
            resultTerm.termType === 'Literal' && !resultTerm.insertMode) { // dont replace with default values added for insert mode
          return resultTerm;
        }
      }
    }
  }
  // blank node -> replace with named variable
  if (isBlankNodeTerm(object)) {
    return factoryCreateRDFVariable(object.value);
  }
  // default
  return object;
}

function replaceObjectVariableInsertMode(object: SparqlJS.Term, sparqlResultBindings: SparqlEditResultBindings): SparqlJS.Term {
  if (isVariableTerm(object)) {
    const varName = object.value;
    // iterate over variables list
    for (const resultVariable of Object.keys(sparqlResultBindings)) {
      if (varName === resultVariable) { // match: same variable
        // replace with cell value from result bindings
        const resultTerm = sparqlResultBindings[resultVariable];
        if (resultTerm.termType == 'NamedNode' ||
            resultTerm.termType === 'Literal' && !resultTerm.insertMode) { // dont replace with default values added for insert mode
          return resultTerm;
        }
      }
    }
    // if still variable = no value found in bindingRow -> set to blankNode
    if (isVariableTerm(object)) { 
      return factory.blankNode(object.value);
    }
  }
  // default
  return object;
}

// 3. build update query

function buildUpdateQuery(modQuery: SparqlJS.SelectQuery, editedVar: EditedVariableInfo, sparqlEditResultRow: SparqlEditResultBindings, editedOptionalTriples: SparqlJS.Triple[] | null, editedVarBgpTripleRef: SparqlJS.Triple) {
  const updateOperation: SparqlJS.InsertDeleteOperation = {
    updateType: 'insertdelete',
    delete: [],
    insert: [],
    where: []
  };

  // 3.1 create blank object and copy prefixes
  const updateQueryObject: SparqlJS.Update = {
    type: 'update',
    updates: [updateOperation],
    prefixes: modQuery.prefixes
  };

  // 3.2 copy modified 'where' part
  if (modQuery.where === undefined) {
    throw new Error("missing 'WHERE' block");
  }
  updateOperation.where = modQuery.where.filter(isBgpPattern);

  // 3.3 construct 'insert' and 'delete part'
  if (editedVar.insertMode === true) {
    if (!editedOptionalTriples) {
      throw new Error('did not find edited optional triples required for insert mode');
    }
    const insertPattern = buildInsertTriples(sparqlEditResultRow, editedOptionalTriples, editedVar);
    updateOperation.insert ? updateOperation.insert.push(insertPattern) : updateOperation.insert = [insertPattern];
  } else {
    // normal value update
    const deletePattern = buildDeleteTriple(editedVarBgpTripleRef, editedVar);
    const insertPattern = buildInsertTriple(editedVarBgpTripleRef, editedVar);
    updateOperation.delete ? updateOperation.delete.push(deletePattern) : updateOperation.delete = [deletePattern];
    updateOperation.insert ? updateOperation.insert.push(insertPattern) : updateOperation.insert = [insertPattern];
  }

  // 3.4 copy default graph name
  if (modQuery?.from?.default[0]) { // if FROM present
    // copy to 'graph' property in update query obj
    updateOperation.graph = modQuery.from.default[0];
  }

  return updateQueryObject;
}

function buildDeleteTriple(editedVarBgpTripleRef: SparqlJS.Triple, editedVar: EditedVariableInfo) {
  // one delete triple
  const deleteBgpPattern: SparqlJS.BgpPattern = {
    type: 'bgp',
    triples: [editedVarBgpTripleRef]
  };
  return deleteBgpPattern;
}

function buildInsertTriple(editedVarBgpTripleRef: SparqlJS.Triple, editedVar: EditedVariableInfo) {
  // one insert triple
  let insertCopy: SparqlJS.Triple = JSON.parse(JSON.stringify(editedVarBgpTripleRef));
  const insertValueLiteral = factory.literal(
    editedVar.valueNew,
    editedVar.language ? editedVar.language : editedVar.datatype
  );
  insertCopy.object = insertValueLiteral;
  const insertBgpPattern: SparqlJS.BgpPattern = {
    type: 'bgp',
    triples: [insertCopy]
  };
  return insertBgpPattern;
}

function buildInsertTriples(sparqlResultBindings: SparqlEditResultBindings, editedOptionalTriples: SparqlJS.Triple[], editedVar: EditedVariableInfo) {
  // insert user-defined value and replace variables in optional BGP
  let insertTriples: SparqlJS.Triple[] = JSON.parse(JSON.stringify(editedOptionalTriples));
  insertTriples.forEach(triple => {
    // insert new value
    const tripleObj = triple.object;
    if (isVariableTerm(tripleObj) && tripleObj.value === editedVar.name) {
      // replace variable with a literal containing the new user-defined value
      const insertValueLiteral = factory.literal(
        editedVar.valueNew,
        editedVar.language ? editedVar.language : editedVar.datatype
      );
      triple.object = insertValueLiteral;
    }
  
    // replace subject, predicate and object
    triple.subject = replaceSubjectVariableInsertMode(triple.subject, sparqlResultBindings);
    triple.predicate = replacePredicateVariable(triple.predicate, sparqlResultBindings);
    triple.object = replaceObjectVariableInsertMode(triple.object, sparqlResultBindings);
  });

  const insertBgpPattern: SparqlJS.BgpPattern = {
    type: 'bgp',
    triples: insertTriples
  };
  return insertBgpPattern;
}

// RDF factory and helper functions

// factory for creating RDF Terms
import { DataFactory } from 'rdf-data-factory';
const factory: RDF.DataFactory = new DataFactory();

function factoryCreateRDFVariable(value: string): RDF.Variable {
  if (factory.variable) {
    return factory.variable(value);
  } else {
    return {
      termType: 'Variable',
      value,
    } as RDF.Variable;
  }
}

// user-defined type guards for type narrowing when filtering
function isBgpPattern(pattern: SparqlJS.Pattern): pattern is SparqlJS.BgpPattern {
  return pattern.type === 'bgp';
}

function isOptionalPattern(pattern: SparqlJS.Pattern): pattern is SparqlJS.OptionalPattern {
  return pattern.type === 'optional';
}

function isVariableTerm(term: RDF.Term): term is RDF.Variable {
  return term.termType === 'Variable';
}

function isPropertyPath(termOrPath: RDF.Term | SparqlJS.PropertyPath): termOrPath is SparqlJS.PropertyPath {
  return termOrPath.hasOwnProperty('pathType');
}

function isBlankNodeTerm(term: RDF.Term): term is RDF.BlankNode {
  return term.termType === 'BlankNode';
}