import { IBindings } from "fetch-sparql-endpoint";
import { SparqlQuery } from "sparqljs";

export class QuerySubmission {
  constructor(endpointQuery: string, endpointUpdate: string, queryString: string);
  endpointQuery: string;
  endpointUpdate: string;
  queryString: string;
  getQueryObject(): SparqlQuery;
}

export class QuerySubmissionResult {
  constructor(querySubmission: QuerySubmission, queryResult: Array<IBindings>|string);
  querySubmission: QuerySubmission;
  queryResult: Array<IBindings>|string;
}