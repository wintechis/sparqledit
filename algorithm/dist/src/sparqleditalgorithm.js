"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUpdateCheckQuery = exports.buildUpdateQuery = void 0;
const SparqlJS = require("sparqljs");
const helper_1 = require("./helper");
/**
 * SPARQL_edit algorithm: create update query for view update
 * @param selectQueryObject parsed JS object of the original SPARQL Select query
 * @param sparqlEditResultRow the row of all ResultBindungs that contains the edited variable value; extended with information for SPARQL_edit
 * @returns JS object of the created SPARQL Update query
 */
function buildUpdateQuery(selectQueryObject, sparqlEditResultRow) {
    // 0. clone original query object
    const modQuery = deepCopySelectQuery(selectQueryObject);
    // 1. analyse edited variable
    // 1.1 collect information about the edited literal (= variable in query)
    const editedVar = findEditedVariableInResultRow(sparqlEditResultRow);
    // 1.2 collect BGP triples and find triple with edited variable
    const editedVarBgpTripleRef = findEditedVariableBgpTriple(modQuery, editedVar);
    // 1.3 check if edited/inserted variable in BGP of an optional block
    const editedOptionalTriples = findEditedVariableOptionalBgpTriples(modQuery, editedVar);
    // if NOT insert mode && optional var edited: copy optional bgp as normal bgp to query's where array
    if (editedVar.insertMode !== true && editedOptionalTriples) {
        const optBgpPattern = {
            type: 'bgp',
            triples: editedOptionalTriples
        };
        modQuery.where.push(optBgpPattern);
    }
    // 2. rebuild the query's where block 
    rebuildQueryWhereBlock(modQuery, sparqlEditResultRow);
    //console.dir(modQuery, { depth: null })
    // 3. build update query
    const updateQueryObject = buildUpdateQueryObject(modQuery, editedVar, sparqlEditResultRow, editedOptionalTriples, editedVarBgpTripleRef);
    //console.dir(updateQueryObject, { depth: null })
    return updateQueryObject;
}
exports.buildUpdateQuery = buildUpdateQuery;
/**
 * Update preflight check query
 * @param selectQueryObject parsed JS object of the original SPARQL Select query
 * @param sparqlEditResultRow the row of all ResultBindungs that contains the edited variable value; extended with information for SPARQL_edit
 * @returns JS object of a SPARQL/Select query for checking
 */
function buildUpdateCheckQuery(selectQueryObject, sparqlEditResultRow) {
    // same procedure as 'buildUpdateQueryObject' without the third step for the update query (skip generation of insert-delete clauses)
    // 0. clone original query object and make wildcard query
    const modQuery = deepCopySelectQuery(selectQueryObject, true);
    // 1. analyse edited variable
    // 1.1 collect information about the edited literal (= variable in query)
    const editedVar = findEditedVariableInResultRow(sparqlEditResultRow);
    // 1.3 check if edited/inserted variable in BGP of an optional block
    const editedOptionalTriples = findEditedVariableOptionalBgpTriples(modQuery, editedVar);
    // if NOT insert mode && optional var edited: copy optional bgp as normal bgp to query's where array
    if (editedVar.insertMode !== true && editedOptionalTriples) {
        const optBgpPattern = {
            type: 'bgp',
            triples: editedOptionalTriples
        };
        modQuery.where.push(optBgpPattern);
    }
    // 2. rebuild the query's where block 
    rebuildQueryWhereBlock(modQuery, sparqlEditResultRow);
    //console.dir(modQuery, { depth: null });
    // 4. finalize check query
    if (hasWhereBlockVariable(modQuery.where) === false) {
        // if check query does not have variables, we need to extend it so that we will have 0 or 1 solutions
        addMeaninglessBindPattern(modQuery);
    }
    delete modQuery.values; // remove any value bindings ('VALUES') that would change number of results
    return modQuery;
}
exports.buildUpdateCheckQuery = buildUpdateCheckQuery;
// 0. prepare query (object)
function deepCopySelectQuery(selectQueryObject, makeWildcard = false) {
    if (!(0, helper_1.isSelectWhereQuery)(selectQueryObject)) {
        throw new Error("missing 'WHERE' block");
    }
    const modQuery = JSON.parse(JSON.stringify(selectQueryObject));
    if (makeWildcard) {
        modQuery.variables = [new SparqlJS.Wildcard()];
    }
    return modQuery;
}
// 1. analyse edited variable
function findEditedVariableInResultRow(sparqlEditResultRow) {
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
function findEditedVariableBgpTriple(modQuery, editedVar) {
    const bgpTriples = modQuery.where
        .filter(helper_1.isBgpPattern)
        .flatMap(bgpPattern => bgpPattern.triples);
    const optTriples = modQuery.where
        .filter(helper_1.isOptionalPattern)
        .flatMap(optPattern => optPattern.patterns)
        .filter(helper_1.isBgpPattern)
        .flatMap(bgpPattern => bgpPattern.triples);
    // iterate over bgp triples and compare variable names
    const allTriples = bgpTriples.concat(optTriples);
    const editedVarBgpTripleRef = allTriples
        .filter(triple => triple['object'].termType === 'Variable')
        .find(varTriple => varTriple['object'].value === editedVar.name); // name match
    if (!editedVarBgpTripleRef) {
        throw new Error('no BGP triple with edited variable found');
    }
    else {
        return editedVarBgpTripleRef;
    }
}
function findEditedVariableOptionalBgpTriples(modQuery, editedVar) {
    let editedOptionalTriples = null;
    const optPatterns = modQuery.where
        .filter(helper_1.isOptionalPattern);
    for (const optPattern of optPatterns) {
        const triples = optPattern.patterns
            .filter(helper_1.isBgpPattern)
            .flatMap(bgpPattern => bgpPattern.triples);
        const foundMatch = triples
            .map(triple => triple['object'])
            .filter(helper_1.isVariableTerm)
            .some(variable => variable.value === editedVar.name);
        if (foundMatch) {
            editedOptionalTriples = triples;
        }
    }
    return editedOptionalTriples;
}
// 2. rebuild the query's where block 
function rebuildQueryWhereBlock(modQuery, sparqlEditResultRow) {
    for (let i = modQuery.where.length - 1; i >= 0; i--) {
        let pattern = modQuery.where[i];
        // case: BGP
        if ((0, helper_1.isBgpPattern)(pattern)) {
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
function replaceAllNamedVariables(bgpTriples, sparqlResultBindings) {
    // replace all (named) variables with literal + value in bgp
    bgpTriples.forEach(triple => {
        // replace subject, predicate and object
        triple.subject = replaceSubjectVariable(triple.subject, sparqlResultBindings);
        triple.predicate = replacePredicateVariable(triple.predicate, sparqlResultBindings);
        triple.object = replaceObjectVariable(triple.object, sparqlResultBindings);
    });
}
function replaceSubjectVariable(subject, sparqlResultBindings) {
    if ((0, helper_1.isVariableTerm)(subject)) {
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
    if ((0, helper_1.isBlankNodeTerm)(subject)) {
        return (0, helper_1.createRDFVariable)(subject.value);
    }
    // default
    return subject;
}
function replaceSubjectVariableInsertMode(subject, sparqlResultBindings) {
    if ((0, helper_1.isVariableTerm)(subject)) {
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
        if ((0, helper_1.isVariableTerm)(subject)) {
            return helper_1.factory.blankNode(subject.value);
        }
    }
    // default
    return subject;
}
function replacePredicateVariable(predicate, sparqlResultBindings) {
    if (!(0, helper_1.isPropertyPath)(predicate) && (0, helper_1.isVariableTerm)(predicate)) {
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
function replaceObjectVariable(object, sparqlResultBindings) {
    if ((0, helper_1.isVariableTerm)(object)) {
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
    if ((0, helper_1.isBlankNodeTerm)(object)) {
        return (0, helper_1.createRDFVariable)(object.value);
    }
    // default
    return object;
}
function replaceObjectVariableInsertMode(object, sparqlResultBindings) {
    if ((0, helper_1.isVariableTerm)(object)) {
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
        if ((0, helper_1.isVariableTerm)(object)) {
            return helper_1.factory.blankNode(object.value);
        }
    }
    // default
    return object;
}
// 3. build update query
function buildUpdateQueryObject(modQuery, editedVar, sparqlEditResultRow, editedOptionalTriples, editedVarBgpTripleRef) {
    var _a;
    const updateOperation = {
        updateType: 'insertdelete',
        delete: [],
        insert: [],
        where: []
    };
    // 3.1 create blank object and copy prefixes
    const updateQueryObject = {
        type: 'update',
        updates: [updateOperation],
        prefixes: modQuery.prefixes
    };
    // 3.2 copy modified 'where' part
    updateOperation.where = modQuery.where.filter(helper_1.isBgpPattern);
    // 3.3 construct 'insert' and 'delete part'
    if (editedVar.insertMode === true) {
        if (!editedOptionalTriples) {
            throw new Error('did not find edited optional triples required for insert mode');
        }
        const insertPattern = buildInsertTriples(sparqlEditResultRow, editedOptionalTriples, editedVar);
        updateOperation.insert ? updateOperation.insert.push(insertPattern) : updateOperation.insert = [insertPattern];
    }
    else {
        // normal value update
        const deletePattern = buildDeleteTriple(editedVarBgpTripleRef, editedVar);
        const insertPattern = buildInsertTriple(editedVarBgpTripleRef, editedVar);
        updateOperation.delete ? updateOperation.delete.push(deletePattern) : updateOperation.delete = [deletePattern];
        updateOperation.insert ? updateOperation.insert.push(insertPattern) : updateOperation.insert = [insertPattern];
    }
    // 3.4 copy default graph name
    if ((_a = modQuery === null || modQuery === void 0 ? void 0 : modQuery.from) === null || _a === void 0 ? void 0 : _a.default[0]) { // if FROM present
        // copy to 'graph' property in update query obj
        updateOperation.graph = modQuery.from.default[0];
    }
    return updateQueryObject;
}
function buildDeleteTriple(editedVarBgpTripleRef, editedVar) {
    // one delete triple
    const deleteBgpPattern = {
        type: 'bgp',
        triples: [editedVarBgpTripleRef]
    };
    return deleteBgpPattern;
}
function buildInsertTriple(editedVarBgpTripleRef, editedVar) {
    // one insert triple
    let insertCopy = JSON.parse(JSON.stringify(editedVarBgpTripleRef));
    const insertValueLiteral = helper_1.factory.literal(editedVar.valueNew, editedVar.language ? editedVar.language : editedVar.datatype);
    insertCopy.object = insertValueLiteral;
    const insertBgpPattern = {
        type: 'bgp',
        triples: [insertCopy]
    };
    return insertBgpPattern;
}
function buildInsertTriples(sparqlResultBindings, editedOptionalTriples, editedVar) {
    // insert user-defined value and replace variables in optional BGP
    let insertTriples = JSON.parse(JSON.stringify(editedOptionalTriples));
    insertTriples.forEach(triple => {
        // insert new value
        const tripleObj = triple.object;
        if ((0, helper_1.isVariableTerm)(tripleObj) && tripleObj.value === editedVar.name) {
            // replace variable with a literal containing the new user-defined value
            const insertValueLiteral = helper_1.factory.literal(editedVar.valueNew, editedVar.language ? editedVar.language : editedVar.datatype);
            triple.object = insertValueLiteral;
        }
        // replace subject, predicate and object
        triple.subject = replaceSubjectVariableInsertMode(triple.subject, sparqlResultBindings);
        triple.predicate = replacePredicateVariable(triple.predicate, sparqlResultBindings);
        triple.object = replaceObjectVariableInsertMode(triple.object, sparqlResultBindings);
    });
    const insertBgpPattern = {
        type: 'bgp',
        triples: insertTriples
    };
    return insertBgpPattern;
}
// 4. check query
function hasWhereBlockVariable(wherePatterns) {
    return wherePatterns
        .filter((pattern) => (0, helper_1.isBgpPattern)(pattern))
        .flatMap(pattern => pattern.triples)
        .some(triple => (0, helper_1.isVariableTerm)(triple.subject) || (0, helper_1.isVariableTerm)(triple.object));
}
function addMeaninglessBindPattern(modQuery) {
    const meaninglessBindStatement = {
        type: "bind",
        variable: (0, helper_1.createRDFVariable)('meaninglessVariable'),
        expression: {
            type: "operation",
            operator: "now",
            args: []
        }
    };
    modQuery.where.push(meaninglessBindStatement);
}
//# sourceMappingURL=sparqleditalgorithm.js.map