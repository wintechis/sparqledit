import * as SparqlJS from 'sparqljs';
import { SparqlEditResultBindings } from './types';
/**
 * SPARQL_edit algorithm
 * @param selectQueryObject parsed JS object of the original SPARQL Select query
 * @param sparqlEditResultRow the row of all ResultBindungs that contains the edited variable value; extended with information for SPARQL_edit
 * @returns JS object of the created SPARQL Update query
 */
export declare function buildUpdateQueryObject(selectQueryObject: SparqlJS.SelectQuery, sparqlEditResultRow: SparqlEditResultBindings): SparqlJS.Update;
