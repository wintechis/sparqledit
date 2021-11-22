export default class QuerySubmission {
  constructor(endpointQuery, endpointUpdate, queryString) {
    this.endpointQuery = endpointQuery;
    this.endpointUpdate = endpointUpdate;
    this.queryString = queryString;
  }
}