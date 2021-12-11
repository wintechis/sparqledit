export class QueryError extends Error {
  constructor(message, endpointQuery) {
    super(message);
    this.name = "QueryError";
    this.endpointQuery = endpointQuery;
  }
}

export class UpdateError extends Error {
  constructor(message, endpointUpdate) {
    super(message);
    this.name = "UpdateError";
    this.endpointUpdate = endpointUpdate;
  }
}

export class BuildingError extends Error {
  constructor(message) {
    super(message);
    this.name = "BuildingError";
  }
}