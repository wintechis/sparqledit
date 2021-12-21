import { Quad } from 'n3';

declare class SparqlView {
  constructor(
    public name: string,
    public description: string,
    public creator: string,
    public dateCreated: Date,
    public queryURL: string,
    public updateURL: string,
    public query: string,
    public requiresBasicAuth: boolean
  );
  private createRdfQuads(): Quad[];
  serializeToTurtle(): string;
  serializeToJsonld(): string;
}

