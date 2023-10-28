import * as RDF from "@rdfjs/types";
import * as SparqlJS from 'sparqljs';
export interface SparqlResultBindings {
    [key: string]: RDF.Term;
}
export type SparqlResult = SparqlResultBindings[];
export type SparqlEditTerm = RDF.NamedNode & {
    include?: boolean;
} | RDF.Literal & {
    include?: boolean;
    valueNew?: string;
    insertMode?: boolean;
};
export interface SparqlEditResultBindings extends SparqlResultBindings {
    [key: string]: SparqlEditTerm;
}
export type SparqlEditResult = SparqlEditResultBindings[];
export type EditedVariableInfo = {
    name: string;
    datatype: RDF.NamedNode;
    language: string;
    valueNew: string;
    insertMode: boolean;
};
export type SubjectType = RDF.NamedNode | RDF.Variable | RDF.BlankNode | RDF.Quad;
export type PredicateType = RDF.NamedNode | RDF.Variable | SparqlJS.PropertyPath;
export type SelectWhereQuery = Omit<SparqlJS.SelectQuery, 'where'> & {
    where: SparqlJS.Pattern[];
};
