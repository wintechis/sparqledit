export class QuerySubmission {
  constructor(endpointQuery, endpointUpdate, queryString, credentials) {
    this.endpointQuery = endpointQuery;
    this.endpointUpdate = endpointUpdate;
    this.queryString = queryString;
    this.credentials = credentials;
  }
}

export class QuerySubmissionResult {
  constructor(querySubmission, queryResult, queryObject) {
    this.querySubmission = querySubmission;
    this.queryResult = queryResult;
    this.queryObject = queryObject;
  }
}