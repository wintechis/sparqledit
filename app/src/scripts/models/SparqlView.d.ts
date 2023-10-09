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
    updateLogGraph: undefined | string,
    restrictedVariable: undefined | string[]
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
  updateLogGraph: undefined | string;
  restrictedVariable: undefined | string[];
  serializeToTurtle(): Promise<string>;
  serializeToJsonld(): Promise<string>;
}

