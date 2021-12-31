declare class SparqlView {
  constructor(
    name: string,
    description: string,
    creator: string,
    dateCreated: Date,
    queryURL: string,
    updateURL: string,
    query: string,
    requiresBasicAuth: boolean
  );
  name: string;
  description: string;
  creator: string;
  dateCreated: Date;
  queryURL: string;
  updateURL: string;
  query: string;
  requiresBasicAuth: boolean
  serializeToTurtle(): string;
  serializeToJsonld(): string;
}

