import * as RDF from "@rdfjs/types";
import * as SparqlJS from 'sparqljs';
import { SelectWhereQuery } from './types';
import { DataFactory } from 'rdf-data-factory';

// factory for creating RDF Terms

export const factory: RDF.DataFactory = new DataFactory();

export function createRDFVariable(value: string): RDF.Variable {
  if (factory.variable) {
    return factory.variable(value);
  } else {
    return {
      termType: 'Variable',
      value,
    } as RDF.Variable;
  }
}

// user-defined type guards for type narrowing

export function isSelectWhereQuery(selectQueryObject: SparqlJS.SelectQuery): selectQueryObject is SelectWhereQuery {
  return selectQueryObject.where !== undefined
}

export function isBgpPattern(pattern: SparqlJS.Pattern): pattern is SparqlJS.BgpPattern {
  return pattern.type === 'bgp';
}

export function isOptionalPattern(pattern: SparqlJS.Pattern): pattern is SparqlJS.OptionalPattern {
  return pattern.type === 'optional';
}

export function isVariableTerm(term: RDF.Term): term is RDF.Variable {
  return term.termType === 'Variable';
}

export function isPropertyPath(termOrPath: RDF.Term | SparqlJS.PropertyPath): termOrPath is SparqlJS.PropertyPath {
  return termOrPath.hasOwnProperty('pathType');
}

export function isBlankNodeTerm(term: RDF.Term): term is RDF.BlankNode {
  return term.termType === 'BlankNode';
}