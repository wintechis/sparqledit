import * as RDF from "@rdfjs/types";
import * as SparqlJS from 'sparqljs';
export interface SparqlResultBindings {
    [key: string]: RDF.Term;
}
export declare type SparqlResult = SparqlResultBindings[];
export declare type SparqlEditTerm = RDF.NamedNode & {
    include?: boolean;
} | RDF.Literal & {
    include?: boolean;
    valueNew?: string;
    insertMode?: boolean;
};
export interface SparqlEditResultBindings extends SparqlResultBindings {
    [key: string]: SparqlEditTerm;
}
export declare type SparqlEditResult = SparqlEditResultBindings[];
export declare type EditedVariableInfo = {
    name: string;
    datatype: RDF.NamedNode;
    language: string;
    valueNew: string;
    insertMode: boolean;
};
export declare type SubjectType = RDF.NamedNode | RDF.Variable | RDF.BlankNode | RDF.Quad;
export declare type PredicateType = RDF.NamedNode | RDF.Variable | SparqlJS.PropertyPath;
