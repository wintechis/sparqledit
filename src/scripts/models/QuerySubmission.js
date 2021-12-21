import { buildQueryObject } from '../sparqledit';

export class QuerySubmission {
  constructor(endpointQuery, endpointUpdate, queryString) {
    this.endpointQuery = endpointQuery;
    this.endpointUpdate = endpointUpdate;
    this.queryString = queryString;
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