import SparqlView from "./SparqlView";

export function getSparqlViewExampleByKey(id, sparqlViewKey) {
  switch (sparqlViewKey.toLowerCase().trim()) {
    case 'simple':
      return sparqlView_simpleSPO(id);
    case 'advanced':
      return sparqlView_advancedExample(id);
    case 'product':
      return sparqlView_productCatalog(id);
    case 'patient':
    case 'patients':
      return sparqlView_patients(id);
    case 'physician':
    case 'physicians':
      return sparqlView_physicians(id);
    case 'patient-physician':
      return sparqlView_patientsPhysicians(id);
    case 'nobelprizes':
    case 'nobel-prizes':
      return sparqlView_nobelPrizes(id);
    case 'nobel-laureates':
      return sparqlView_nobelPrizesLaureates(id);
    default:
      return sparqlView_simpleSPO(id);
  }
}

const simpleSPOQuery = 'SELECT *\nWHERE {\n  ?s ?p ?o\n  FILTER( isLiteral(?o) )\n} LIMIT 100';
const sparqlView_simpleSPO = id => new SparqlView(id,
  'Simple S-P-O view',
  'Edit this view or create a new one.\nConnect to a SPARQL endpoint and edit any literal value.',
  'system',
  Date.now(),
  'http://localhost:3030/example/query',
  'http://localhost:3030/example/update',
  simpleSPOQuery,
  false
);

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
const sparqlView_advancedExample = id => new SparqlView(id,
  'Advanced features example view',
  'This example view shows SPARQL language features which are supported by SPARQL_edit.',
  'system',
  Date.now(),
  'http://localhost:7200/repositories/test',
  'http://localhost:7200/repositories/test/statements',
  advancedExampleQuery,
  true
);

const productCatalogQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX schema: <http://schema.org/>

SELECT ?product ?name ?gtin ?weight
FROM <http://example.org/graph/productcatalog-0>
WHERE {
  ?product rdf:type schema:Product ;
    schema:name ?name ;
    schema:gtin ?gtin ;
    schema:weight [
      schema:value ?weight
    ]
  FILTER (lang(?name) = 'en')
}
`.trim();
const sparqlView_productCatalog = id => new SparqlView(id,
  'Product Catalog',
  'Product catalog view for all products from department C3. Version 202206-B',
  'Alice A.',
  Date.parse('2023-02-01T11:19:49.483Z'),
  'https://fuseki.iis.fraunhofer.de/sparqledit-example/query',
  'https://fuseki.iis.fraunhofer.de/sparqledit-example/update',
  productCatalogQuery,
  true
);

const patientQuery = `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>

SELECT ?physician ?telephone ?address ?postalCode
FROM <http://example.org/graph/patients-0>
WHERE {
  ?physician a schema:Physician ;
    schema:telephone ?telephone ;
    schema:isAcceptingNewPatients ?acceptNewPatients .
  OPTIONAL {
    ?physician schema:address [
      a schema:PostalAddress ;
      schema:streetAddress ?address ;
      schema:postalCode ?postalCode
    ]
  }
}
`.trim();
const sparqlView_patients = id => new SparqlView(id,
  'Patients Example',
  "Table of patients' names, birthdates and weights.\nView for the example dataset made with schema.org concepts.",
  'Alice A.',
  Date.parse('2022-12-01T16:21:17.660Z'),
  'https://fuseki.iis.fraunhofer.de/sparqledit-example/query',
  'https://fuseki.iis.fraunhofer.de/sparqledit-example/update',
  patientQuery,
  true
);

const physicianQuery = `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>

SELECT *
FROM <http://example.org/graph/patients-0>
WHERE {
  ?patient a schema:Patient ;
    foaf:name ?name ;
    schema:birthDate ?birthdate .
  OPTIONAL {
    ?patient schema:weight [
      schema:value ?weight
    ]
  }
}
`.trim();
const sparqlView_physicians = id => new SparqlView(id,
  'Physicians Example',
  'Table of physicians.\nView for the example dataset made with schema.org concepts.',
  'Alice A.',
  Date.parse('2022-12-01T16:28:08.000Z'),
  'https://fuseki.iis.fraunhofer.de/sparqledit-example/query',
  'https://fuseki.iis.fraunhofer.de/sparqledit-example/update',
  physicianQuery,
  true
);

const patientPhysicianQuery = `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>

SELECT ?name ?family ?birthdate ?weight ?medoffice ?medoffice_street ?medoffice_zip
FROM <http://example.org/graph/patients-0>
WHERE {
  ?patient a schema:Patient ;
    foaf:name ?name .
  OPTIONAL {  
    ?patient foaf:familyName ?family . 
  }
  ?patient schema:birthDate ?birthdate .
  OPTIONAL {
    ?patient schema:weight [
      schema:value ?weight
    ] .
  }
  OPTIONAL {
    ?patient schema:memberOf ?medoffice .
    ?medoffice schema:address [
      schema:streetAddress ?medoffice_street ;
      schema:postalCode ?medoffice_zip  
    ] .
  }
}
`.trim();
const sparqlView_patientsPhysicians = id => new SparqlView(id,
  'Patients-Physicians Example',
  'Table of patients and their physicians.\nView for the example dataset made with schema.org concepts.\n(enabled update logging)',
  'Alice A.',
  Date.parse('2023-01-15T17:20:00.000Z'),
  'https://fuseki.iis.fraunhofer.de/sparqledit-example/query',
  'https://fuseki.iis.fraunhofer.de/sparqledit-example/update',
  patientPhysicianQuery,
  true,
  'http://example.org/graph/updatelog-0'
);

const nobelPrizesQuery = `
PREFIX nobel: <http://data.nobelprize.org/terms/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbo: <http://dbpedia.org/ontology/>

SELECT ?name ?university ?prizeName ?prizeYear ?prizeMotivation
WHERE {
  ?person rdf:type nobel:Laureate ;
    rdfs:label ?name ;
    nobel:nobelPrize ?prize .
  OPTIONAL {
    ?person dbo:affiliation [
    	rdfs:label ?university
 	  ] ;
    FILTER (lang(?university) = 'en')
  }
  ?prize rdfs:label ?prizeName ;
    nobel:year ?prizeYear .
  OPTIONAL {
  	?prize nobel:motivation ?prizeMotivation .
    FILTER (lang(?prizeMotivation) = 'en')
  }
  FILTER (lang(?prizeName) = 'en')
}
ORDER BY ?prizeYear ?name
`.trim();
const sparqlView_nobelPrizes = id => new SparqlView(id,
  'Nobel Prizes',
  "Test view for the 'Nobel Prizes as Linked Data' dataset.",
  'Susan S.',
  Date.parse('2023-05-05T11:30:03.450Z'),
  'https://fuseki.iis.fraunhofer.de/nobelprizes/',
  'https://fuseki.iis.fraunhofer.de/nobelprizes/',
  nobelPrizesQuery,
  true
);

const nobelPrizesLaureatesQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbp: <http://dbpedia.org/property/>
PREFIX nobel: <http://data.nobelprize.org/terms/>

SELECT ?familyName ?givenName ?birthday ?gender ?dateOfBirth ?dateOfDeath ?birthPlace ?deathPlace ?affiliation
WHERE {
  ?laureate rdf:type nobel:Laureate .
  ?laureate rdfs:label ?label .
  ?laureate foaf:name ?name .
  ?laureate foaf:familyName ?familyName .
  ?laureate foaf:givenName ?givenName .
  ?laureate foaf:birthday ?birthday .
  ?laureate foaf:gender ?gender .
  ?laureate dbp:dateOfBirth ?dateOfBirth .
  ?laureate dbp:dateOfDeath ?dateOfDeath .
  ?laureate dbo:birthPlace ?birthPlaceURI .
  ?birthPlaceURI a dbo:Country .
  ?birthPlaceURI rdfs:label ?birthPlace .
  FILTER (lang(?birthPlace) = 'en')
  ?laureate dbo:deathPlace ?deathPlaceURI .
  ?deathPlaceURI a dbo:Country .
  ?deathPlaceURI rdfs:label ?deathPlace .
  FILTER (lang(?deathPlace) = 'en')
  ?laureate dbo:affiliation ?affiliationURI .
  ?affiliationURI rdfs:label ?affiliation .
  FILTER (lang(?affiliation) = 'en')
}
`.trim();
const sparqlView_nobelPrizesLaureates = id => new SparqlView(id,
  'Nobel Prizes - Laureates',
  "A test view for the 'Nobel Prizes as Linked Data' dataset. It lists information about laureates.",
  'Susan S.',
  Date.parse('2023-05-05T11:42:11.000Z'),
  'https://fuseki.iis.fraunhofer.de/nobelprizes/',
  'https://fuseki.iis.fraunhofer.de/nobelprizes/',
  nobelPrizesLaureatesQuery,
  true
);