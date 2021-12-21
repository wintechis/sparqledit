import { IBindings } from "fetch-sparql-endpoint";
import { SparqlQuery } from "sparqljs";

declare class QuerySubmission {
  constructor(endpointQuery: string, endpointUpdate: string, queryString: string);
  endpointQuery: string;
  endpointUpdate: string;
  queryString: string;
  getQueryObject(): SparqlQuery;
}

declare class QuerySubmissionResult {
  constructor(querySubmission: QuerySubmission, queryResult: Array<IBindings>|string);
  querySubmission: QuerySubmission;
  queryResult: Array<IBindings>|string;
}