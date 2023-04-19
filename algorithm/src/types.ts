import * as RDF from "@rdfjs/types";
import * as SparqlJS from 'sparqljs';

export interface SparqlResultBindings { // row in the query results
  [key: string]: RDF.Term; // single binding for a variable in the query results
}

export type SparqlResult = SparqlResultBindings[]; // complete query results

export type SparqlEditTerm = 
  | RDF.NamedNode & { include?: boolean }
  | RDF.Literal & {
    include?: boolean, // flag indicating if this variable was selected in the orig. query; irrelevant for algo.
    valueNew?: string, // optional new user-defined value for this literal
    insertMode?: boolean // optional flag indicating if this literal is missing in the queried dataset and must be created/inserted
  };

export interface SparqlEditResultBindings extends SparqlResultBindings { // represents a row in the SPARQL_edit result table
  [key: string]: SparqlEditTerm; // represents the data for a single cell in the result table
}

export type SparqlEditResult = SparqlEditResultBindings[]; // represents the data behind a SPARQL_edit result table

// internal types

export type EditedVariableInfo = {
  name: string;
  datatype: RDF.NamedNode;
  language: string;
  valueNew: string;
  insertMode: boolean;
};

export type SubjectType = RDF.NamedNode | RDF.Variable | RDF.BlankNode | RDF.Quad; // from SparqlJS

export type PredicateType = RDF.NamedNode | RDF.Variable | SparqlJS.PropertyPath; // from SparqlJS

export type SelectWhereQuery = Omit<SparqlJS.SelectQuery, 'where'> & { where: SparqlJS.Pattern[] };