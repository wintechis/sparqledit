export const RDF_NAMESPACES = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  schema: 'http://schema.org/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  vcard: 'http://www.w3.org/2006/vcard/ns#',
  prov: 'http://www.w3.org/ns/prov#',
  spedit: 'http://iis.fraunhofer.de/sparqledit/ontology#'
}

export const SPARQLVIEW_NAMESPACES = {
  rdf: RDF_NAMESPACES.rdf,
  schema: RDF_NAMESPACES.schema,
  xsd: RDF_NAMESPACES.xsd,
  spedit: RDF_NAMESPACES.spedit
}