export default class SparqlView {
  constructor(
    id: string,
    name: string,
    description: string,
    creator: string,
    dateCreated: Date,
    queryURL: string,
    updateURL: string,
    query: string,
    requiresBasicAuth: boolean
  );
  id: string;
  name: string;
  description: string;
  creator: string;
  dateCreated: Date;
  queryURL: string;
  updateURL: string;
  query: string;
  requiresBasicAuth: boolean;
  serializeToTurtle(): string;
  serializeToJsonld(): string;
}

