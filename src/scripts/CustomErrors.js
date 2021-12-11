export class QueryError extends Error {
  constructor(message) {
    super(message);
    this.name = "QueryError";
  }
}

export class BuildingError extends Error {
  constructor(message) {
    super(message);
    this.name = "BuildingError";
  }
}

export class UpdateError extends Error {
  constructor(message) {
    super(message);
    this.name = "UpdateError";
  }
}