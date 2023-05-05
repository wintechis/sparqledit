import SparqlView from "./SparqlView";
import { JsonLdParser } from "jsonld-streaming-parser";
import { RDF_NAMESPACES } from './RdfNamespaces';
import { DataFactory, Store, Parser } from 'n3';
import { RDFProcessingError } from "../CustomErrors";
import { getSparqlViewExampleByKey } from './sparqlviewexamples';

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
      'SELECT *\nWHERE {\n  ?s ?p ?o\n}\nLIMIT 100',
      false
    );
  }

  static newSparqlViewExample(exampleVariantKey) {
    return getSparqlViewExampleByKey(this.generateUnsafeUuid(), exampleVariantKey);
  }

  static newSparqlViewFromObject(object) {
    if (
      object instanceof SparqlView || 
      Object.keys(this.newBlankSparqlView())
        .filter(key => key !== 'updateLogGraph')
        .every(key => object.hasOwnProperty(key)) 
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
    // used in 'SparqlViewList' component: examples for first start
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