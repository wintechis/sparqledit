import { SPARQLVIEW_NAMESPACES } from './RdfNamespaces';
import { DataFactory, Store, Writer } from 'n3';
const { quad, namedNode, literal } = DataFactory;

export default class SparqlView {
  constructor(
    id,
    name,
    description,
    creator,
    dateCreated,
    queryURL,
    updateURL,
    query,
    requiresBasicAuth,
    updateLogGraph
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.creator = creator;
    this.dateCreated = dateCreated;
    this.queryURL = queryURL;
    // if no explicit update endpoint => same as query endpoint
    this.updateURL = updateURL && updateURL.length > 1 ? updateURL : queryURL;
    this.query = query;
    this.requiresBasicAuth = requiresBasicAuth;
    this.updateLogGraph = updateLogGraph;
  }

  createRdfQuads() {
    const store = new Store();
    const subjectBN = store.createBlankNode();
    store.addQuads([
      quad(
        subjectBN,
        namedNode(SPARQLVIEW_NAMESPACES.rdf + 'type'),
        namedNode(SPARQLVIEW_NAMESPACES.spedit + 'SparqlView')
      ),
      quad(
        subjectBN,
        namedNode(SPARQLVIEW_NAMESPACES.schema + 'name'),
        literal(this.name)
      ),
      quad(
        subjectBN,
        namedNode(SPARQLVIEW_NAMESPACES.schema + 'description'),
        literal(this.description)
      ),
      quad(
        subjectBN,
        namedNode(SPARQLVIEW_NAMESPACES.schema + 'creator'),
        literal(this.creator)
      ),
      quad(
        subjectBN,
        namedNode(SPARQLVIEW_NAMESPACES.schema + 'dateCreated'),
        literal(this.dateCreated.toISOString(), namedNode(SPARQLVIEW_NAMESPACES.xsd + 'dateTime'))
      ),
      quad(
        subjectBN,
        namedNode(SPARQLVIEW_NAMESPACES.spedit + 'queryURL'),
        literal(this.queryURL, namedNode(SPARQLVIEW_NAMESPACES.xsd + 'anyURI'))
      ),
      quad(
        subjectBN,
        namedNode(SPARQLVIEW_NAMESPACES.spedit + 'updateURL'),
        literal(this.updateURL, namedNode(SPARQLVIEW_NAMESPACES.xsd + 'anyURI'))
      ),
      quad(
        subjectBN,
        namedNode(SPARQLVIEW_NAMESPACES.spedit + 'query'),
        literal(this.query)
      ),
      quad(
        subjectBN,
        namedNode(SPARQLVIEW_NAMESPACES.spedit + 'requiresBasicAuth'),
        literal(this.requiresBasicAuth, namedNode(SPARQLVIEW_NAMESPACES.xsd + 'boolean'))
      )
    ]);
    if (this.updateLogGraph) {
      store.addQuad(      
        quad(
          subjectBN,
          namedNode(SPARQLVIEW_NAMESPACES.spedit + 'updateLogGraph'),
          literal(this.updateLogGraph, namedNode(SPARQLVIEW_NAMESPACES.xsd + 'anyURI'))
        )
      );
    }
    return store.getQuads();
  }

  serializeToTurtle() {
    const writer = new Writer({ prefixes: SPARQLVIEW_NAMESPACES });
    return new Promise((resolve, reject) => {
      writer.addQuads(this.createRdfQuads());
      writer.end( (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  serializeToJsonld() {
    // copy this instance
    const jsonObj = { ...this };
    delete jsonObj.id; // remove internal id
    // add JSON-LD context and type
    jsonObj['@context'] = {
      ...SPARQLVIEW_NAMESPACES,
      name: {
        '@id': 'schema:name'
      },
      description: {
        '@id': 'schema:description'
      },
      creator: {
        '@id': 'schema:creator',
      },
      dateCreated: {
        '@id': 'schema:dateCreated',
        '@type': 'xsd:dateTime'
      },
      queryURL: {
        '@id': 'spedit:queryURL',
        '@type': 'xsd:anyURI'
      },
      updateURL: {
        '@id': 'spedit:updateURL',
        '@type': 'xsd:anyURI'
      },
      query: {
        '@id': 'spedit:query'
      },
      requiresBasicAuth: {
        '@id': 'spedit:requiresBasicAuth',
        '@type': 'xsd:boolean'
      },
      updateLogGraph: {
        '@id': 'spedit:updateLogGraph',
        '@type': 'xsd:anyURI'
      }
    };
    jsonObj['@type'] = 'spedit:SparqlView';
    const jsonld = JSON.stringify(jsonObj);
    return Promise.resolve(jsonld);
  }
}