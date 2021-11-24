export class QueryError extends Error {
  constructor(message) {
    super(message);
    this.name = "QueryError";
  }
}