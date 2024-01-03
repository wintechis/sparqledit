import * as RDF from "@rdfjs/types";
import * as SparqlJS from 'sparqljs';
import { SelectWhereQuery } from './types';
export declare const factory: RDF.DataFactory;
export declare function createRDFVariable(value: string): RDF.Variable;
export declare function isSelectWhereQuery(selectQueryObject: SparqlJS.SelectQuery): selectQueryObject is SelectWhereQuery;
export declare function isBgpPattern(pattern: SparqlJS.Pattern): pattern is SparqlJS.BgpPattern;
export declare function isOptionalPattern(pattern: SparqlJS.Pattern): pattern is SparqlJS.OptionalPattern;
export declare function isVariableTerm(term: RDF.Term): term is RDF.Variable;
export declare function isPropertyPath(termOrPath: RDF.Term | SparqlJS.PropertyPath): termOrPath is SparqlJS.PropertyPath;
export declare function isBlankNodeTerm(term: RDF.Term): term is RDF.BlankNode;