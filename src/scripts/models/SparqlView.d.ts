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
    requiresBasicAuth: boolean,
    updateLogGraph: string
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
  updateLogGraph: string
  serializeToTurtle(): Promise<string>;
  serializeToJsonld(): Promise<string>;
}

