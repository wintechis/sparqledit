import SparqlView from "./SparqlView";
//import { RDF_NAMESPACES } from './RdfNamespaces';

const simpleExampleQuery = 'SELECT *\nWHERE {\n  ?s ?p ?o\n  FILTER( isLiteral(?o) )\n} LIMIT 25';
const advancedExampleQuery = `
PREFIX schema: <http://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT *
FROM <http://localhost:7200/repositories/test/graph_1>
WHERE {
  ?s ?p ?o .
  OPTIONAL {  
    ?s rdfs:label ?label .
  }
  OPTIONAL {  
    ?s schema:name ?name .
  }
  OPTIONAL {
    ?s ?p [
      rdf:value ?value
    ] .
  }
}`.trim();

export default class SparqlViewFactory {

  static generateUnsafeUuid() {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }

  static newBlankSparqlView() {
    return new SparqlView(
      this.generateUnsafeUuid(),
      'New SPARQL view',
      'This is a new SPARQL view.',
      'unknown user',
      Date.now(),
      '',
      '',
      'SELECT *\nWHERE {\n  ?s ?p ?o\n}',
      false
    );
  }

  static newSparqlViewExample(exmapleVariantKey) {
    switch (exmapleVariantKey.toLowerCase().trim()) {
      case 'simple':
        return new SparqlView(
          this.generateUnsafeUuid(),
          'Simple S-P-O view',
          'Edit this view or create a new one.\nConnect to a SPARQL endpoint and edit any literal value.',
          'system',
          Date.now(),
          'http://localhost:3030/example/query',
          'http://localhost:3030/example/update',
          simpleExampleQuery,
          false
        );
      case 'advanced':
        return new SparqlView(
          this.generateUnsafeUuid(),
          'Advanced features example view',
          'This example view shows SPARQL language features which are supported by SPARQL_edit.',
          'system',
          Date.now(),
          'http://localhost:7200/repositories/test',
          'http://localhost:7200/repositories/test/statements',
          advancedExampleQuery,
          true    
        );
      default:
        return this.newBlankSparqlView();
    }
  }

  static newSparqlViewFromObject(object) {
    if (
      object instanceof SparqlView || 
      Object.keys(new SparqlView()).every(key => object.hasOwnProperty(key)) 
    ) {
      return new SparqlView(
        this.generateUnsafeUuid(),
        object.name,
        object.description,
        object.creator,
        new Date(object.dateCreated),
        object.queryURL,
        object.updateURL,
        object.query,
        object.requiresBasicAuth
      );      
    }
    throw new TypeError('Cannot create a SparqlView instance from this object.');
  }

  static createFrom(input) {
    if (!input) { // null, undefined, 0, ...
      return this.newBlankSparqlView();
    }
    if (input instanceof Object) { // incl. instanceof SparqlView
      return this.newSparqlViewFromObject(input);
    }
    if (typeof input === 'string') {
      return this.newSparqlViewExample(input);
    }
    throw new TypeError('Unable to create a SparqlView instance from ' + input);
  }

}