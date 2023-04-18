"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlankNodeTerm = exports.isPropertyPath = exports.isVariableTerm = exports.isOptionalPattern = exports.isBgpPattern = exports.isSelectWhereQuery = exports.createRDFVariable = exports.factory = void 0;
const rdf_data_factory_1 = require("rdf-data-factory");
// factory for creating RDF Terms
exports.factory = new rdf_data_factory_1.DataFactory();
function createRDFVariable(value) {
    if (exports.factory.variable) {
        return exports.factory.variable(value);
    }
    else {
        return {
            termType: 'Variable',
            value,
        };
    }
}
exports.createRDFVariable = createRDFVariable;
// user-defined type guards for type narrowing
function isSelectWhereQuery(selectQueryObject) {
    return selectQueryObject.where !== undefined;
}
exports.isSelectWhereQuery = isSelectWhereQuery;
function isBgpPattern(pattern) {
    return pattern.type === 'bgp';
}
exports.isBgpPattern = isBgpPattern;
function isOptionalPattern(pattern) {
    return pattern.type === 'optional';
}
exports.isOptionalPattern = isOptionalPattern;
function isVariableTerm(term) {
    return term.termType === 'Variable';
}
exports.isVariableTerm = isVariableTerm;
function isPropertyPath(termOrPath) {
    return termOrPath.hasOwnProperty('pathType');
}
exports.isPropertyPath = isPropertyPath;
function isBlankNodeTerm(term) {
    return term.termType === 'BlankNode';
}
exports.isBlankNodeTerm = isBlankNodeTerm;
//# sourceMappingURL=helper.js.map