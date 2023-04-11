import { IBindings } from "fetch-sparql-endpoint";
import { SparqlQuery } from "sparqljs";

type Credentials = { username: string, password: string }

export class QuerySubmission {
  constructor(endpointQuery: string, endpointUpdate: string, queryString: string, credentials: Credentials);
  endpointQuery: string;
  endpointUpdate: string;
  queryString: string;
  credentials: Credentials;
}

export class QuerySubmissionResult {
  constructor(querySubmission: QuerySubmission, queryResult: Array<IBindings>|string, queryObject: SparqlQuery);
  querySubmission: QuerySubmission;
  queryResult: Array<IBindings>|string;
  queryObject: SparqlQuery;
}