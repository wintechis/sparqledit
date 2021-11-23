import { buildQueryObject } from './sparqledit';

export default class QuerySubmission {
  constructor(endpointQuery, endpointUpdate, queryString) {
    this.endpointQuery = endpointQuery;
    this.endpointUpdate = endpointUpdate;
    this.queryString = queryString;
  }
  getQueryObject() {
    return buildQueryObject(this.queryString);
  }
}