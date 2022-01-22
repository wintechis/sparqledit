import { buildQueryObject } from '../sparqledit';

export class QuerySubmission {
  constructor(endpointQuery, endpointUpdate, queryString, credentials) {
    this.endpointQuery = endpointQuery;
    this.endpointUpdate = endpointUpdate;
    this.queryString = queryString;
    this.credentials = credentials;
  }
  getQueryObject() {
    return buildQueryObject(this.queryString);
  }
}

export class QuerySubmissionResult {
  constructor(querySubmission, queryResult) {
    this.querySubmission = querySubmission;
    this.queryResult = queryResult;
  }
}