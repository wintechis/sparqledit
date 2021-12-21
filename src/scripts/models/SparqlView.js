import { DataFactory, Store, Writer } from 'n3';
const { quad, namedNode, literal } = DataFactory;

const RDF_NAMESPACES = {
  schema: 'http://schema.org/',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  spedit: 'http://iis.fraunhofer.de/sparqledit/ontology#'
}

export default class SparqlView {
  constructor(
    name,
    description,
    creator,
    dateCreated,
    queryURL,
    updateURL,
    query,
    requiresBasicAuth
  ) {
    this.name = name;
    this.description = description;
    this.creator = creator;
    this.dateCreated = dateCreated;
    this.queryURL = queryURL;
    this.updateURL = updateURL;
    this.query = query;
    this.requiresBasicAuth = requiresBasicAuth;
  }

  createRdfQuads() {
    const store = new Store();
    const subjectBN = store.createBlankNode();
    store.addQuads([
      quad(
        subjectBN,
        namedNode(RDF_NAMESPACES.schema + 'name'),
        literal(this.name)
      ),
      quad(
        subjectBN,
        namedNode(RDF_NAMESPACES.schema + 'description'),
        literal(this.description)
      ),
      quad(
        subjectBN,
        namedNode(RDF_NAMESPACES.schema + 'creator'),
        literal(this.creator)
      ),
      quad(
        subjectBN,
        namedNode(RDF_NAMESPACES.schema + 'dateCreated'),
        literal(this.dateCreated.toISOString(), namedNode(RDF_NAMESPACES.xsd + 'dateTime'))
      ),
      quad(
        subjectBN,
        namedNode(RDF_NAMESPACES.spedit + 'queryURL'),
        literal(this.queryURL, namedNode(RDF_NAMESPACES.xsd + 'anyURI'))
      ),
      quad(
        subjectBN,
        namedNode(RDF_NAMESPACES.spedit + 'updateURL'),
        literal(this.updateURL, namedNode(RDF_NAMESPACES.xsd + 'anyURI'))
      ),
      quad(
        subjectBN,
        namedNode(RDF_NAMESPACES.schema + 'query'),
        literal(this.query)
      ),
      quad(
        subjectBN,
        namedNode(RDF_NAMESPACES.schema + 'requiresBasicAuth'),
        literal(this.requiresBasicAuth, namedNode(RDF_NAMESPACES.xsd + 'boolean'))
      )
    ]);
    return store.getQuads();
  }
  serializeToTurtle() {
    const writer = new Writer({ prefixes: RDF_NAMESPACES });
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
    // add JSON-LD context and type
    jsonObj['@context'] = {
      ...RDF_NAMESPACES,
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
        '@id': 'spedit:queryUrl',
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
    };
    jsonObj['@type'] = 'spedit:SparqlView';
    return JSON.stringify(jsonObj);
  }

}