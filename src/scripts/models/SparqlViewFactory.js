import SparqlView from "./SparqlView";
import { JsonLdParser } from "jsonld-streaming-parser";
import { RDF_NAMESPACES } from './RdfNamespaces';
import { DataFactory, Store, Parser } from 'n3';
import { RDFProcessingError } from "../CustomErrors";

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
        object.requiresBasicAuth,
        object.updateLogGraph
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

  static async createFromRDF(rdf, contentType) {
    let quads;
    try {
      if (contentType.toLowerCase().includes('application/ld+json')) {
        quads = await this.parseJsonldToQuads(rdf);
      } else { // N3-Family
        quads = this.parseN3Family(rdf);
      }
      if (quads.length < 1) {
        throw new RDFProcessingError('No RDF quads found.');
      }
      return this.createSparqlViewFromRDFQuads(quads);
    } catch (error) {
      throw new RDFProcessingError(
        `RDF parsing error.\n${error.name} - ${error.message}`);
    }
  }

  static createSparqlViewFromRDFQuads(quads) {
    const { namedNode } = DataFactory;
    const store = new Store();
    store.addQuads(quads);

    if (store.countQuads(null, namedNode(RDF_NAMESPACES.rdf + 'type'), namedNode(RDF_NAMESPACES.spedit + 'SparqlView')) < 1) {
      throw new TypeError('Could not find a SparqlView defintion inside the parsed triples.');
    }
    const sparqlViewBN = store.getSubjects(null, namedNode(RDF_NAMESPACES.rdf + 'type'), namedNode(RDF_NAMESPACES.spedit + 'SparqlView'))[0];
    const name = store.getObjects(sparqlViewBN, namedNode(RDF_NAMESPACES.schema + 'name'), null)[0]?.value || 'unknown name';
    const description = store.getObjects(sparqlViewBN, namedNode(RDF_NAMESPACES.schema + 'description'), null)[0]?.value || 'unknown description';
    const creator = store.getObjects(sparqlViewBN, namedNode(RDF_NAMESPACES.schema + 'creator'), null)[0]?.value || 'unknown creator';
    const dateCreated = new Date(store.getObjects(sparqlViewBN, namedNode(RDF_NAMESPACES.schema + 'dateCreated'), null)[0].value);
    const queryURL = store.getObjects(sparqlViewBN, namedNode(RDF_NAMESPACES.spedit + 'queryURL'), null)[0]?.value || 'unknown queryURL';
    const updateURL = store.getObjects(sparqlViewBN, namedNode(RDF_NAMESPACES.spedit + 'updateURL'), null)[0]?.value || 'unknown updateURL';
    const query = store.getObjects(sparqlViewBN, namedNode(RDF_NAMESPACES.spedit + 'query'), null)[0]?.value || 'unknown query';
    const requiresBasicAuth = store.getObjects(sparqlViewBN, namedNode(RDF_NAMESPACES.spedit + 'requiresBasicAuth'), null)[0]?.value.toLowerCase() == 'true'; // eslint-disable-line eqeqeq
    const updateLogGraph = store.getObjects(sparqlViewBN, namedNode(RDF_NAMESPACES.spedit + 'updateLogGraph'), null)[0]?.value;

    return new SparqlView(
      this.generateUnsafeUuid(),
      name, description, creator, dateCreated,
      queryURL, updateURL, query, requiresBasicAuth,
      updateLogGraph
    );
  }

  static parseJsonldToQuads(jsonld) {
    const myParser = new JsonLdParser();

    return new Promise((resolve, reject) => {
      let quads = [];
      myParser.on('data', quad => {
        quads.push(quad);
      });
      myParser.on('end', () => {
        resolve(quads);
      });
      myParser.on('error', err => {
        console.error(err);
        reject(err);
      });
      myParser.write(jsonld);
      myParser.end();
    });
  }

  static parseN3Family(rdf) {
    const parser = new Parser();
    return parser.parse(rdf); // sync. parsing to Quad[] 
  }

  static clone(sparqlView) {
    return Object.assign(Object.create(Object.getPrototypeOf(sparqlView)), sparqlView);
  }

}