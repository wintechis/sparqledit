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

export class UpdateCheckError extends UpdateError {
  constructor(message, endpointUpdate) {
    super(message, endpointUpdate);
    this.name = "UpdateCheckError";
  }
}

export class BuildingError extends Error {
  constructor(message) {
    super(message);
    this.name = "BuildingError";
  }
}

export class SolidError extends Error {
  constructor(message, fileURL) {
    super(message);
    this.name = "SolidError";
    this.fileURL = fileURL;
  }
}

export class RDFProcessingError extends Error {
  constructor(message) {
    super(message);
    this.name = "RDFProcessingError";
  }
}