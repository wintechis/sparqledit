# SPARQL_edit

alternative name: **L**iteral **EDIT**ing with **SPARQL** (Ledit-SPARQL)

## SPARQL_edit is a Web app that facilitates the editing of RDF literal values in a Knowledge Graph

SPARQL_edit executes user-defined [SPARQL SELECT query](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/) and shows the results in a table.
The result table displays literals as editable input fields where the user can simply change the value. 
When the changes are saved, SPARQL_edit automatically creates a [SPARQL Update query](https://www.w3.org/TR/sparql11-update/) and executes it. 
There are, however, some restrictions for the generation of the update query. This relates to the _database view update problem_.

SPARQL_edit supports simple 'SELECT' queries with a basic graph pattern (BGP) that may contain 
* blank node constructs (n-ary relations)
* 'FILTER' statements
* 'OPTIONAL' triple patterns

### Restrictions
* only queries with all or specific selected variables
* edited SPARQL variable only once in object position
* only literal values (object position) can be edited
* no modified values
  * no calculated values (variable bindings with 'BIND')
  * no aggregation ('GROUP BY')
* blank node problems
  * no RDF containers and collections
* no sub-queries

### Algorithm for generating the update query

Inputs:
* (wildcard) SPARQL SELECT query
* query results
* modified literal (variable name, new value)

Output: SPARQL delete-insert-where query

Procedure:
1. find bgp statement containing the edited variable
    1. collect all bgp triples
    2. find edited variable in object position
2. replace all (named) variables in bgp statements with named nodes (URIs) or literals from query results
    1. go over basic and 'OPTIONAL' bgp triples
    2. if subject, predicate or object is a (named) variable, replace with cell value from result table's row where literal was modified
    3. if subject, predicate or object is blank node, replace with variable
3. build update query
    1. copy prefixes
    2. copy modified BGP triples from (2.)
    3. create 'DELETE' and 'INSERT' triple based on (2.)

Example:
```
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>
SELECT ?name ?birthdate ?weight
WHERE {
  ?patient a schema:Patient ;
    foaf:name ?name ;
    schema:birthDate ?birthdate .
  ?patient schema:weight [
    schema:value ?weight
  ]
}
```
autogenerated update query when changing the patient's weight:
```
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>
DELETE { ?g_25 schema:value "80.5"^^<http://www.w3.org/2001/XMLSchema#decimal>. }
INSERT { ?g_25 schema:value "88"^^<http://www.w3.org/2001/XMLSchema#decimal>. }
WHERE {
  <http://example.org/patient/1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> schema:Patient;
    foaf:name "John Doe";
    schema:birthDate "1990-10-23"^^<http://www.w3.org/2001/XMLSchema#date>;
    schema:weight ?g_25.
  ?g_25 schema:value "80.5"^^<http://www.w3.org/2001/XMLSchema#decimal>.
}
```

## Developer info

SPARQL_edit is a React app written in JavaScript. The styling and design is done with Bootstrap.
SPARQL_edit uses different RDF-related libraries:
* [SPARQL.js](https://github.com/RubenVerborgh/SPARQL.js) for translating SPARQL queries into JS objects and back
* [fetch-sparql-endpoint.js](https://github.com/rubensworks/fetch-sparql-endpoint.js/) for sending queries to the SPARQL endpoint
* [rdf-literal.js](https://github.com/rubensworks/rdf-literal.js) for mapping RDF literals to JavaScript primitives
* [@zazuko/rdf-vocabularies](https://github.com/zazuko/rdf-vocabularies) for shortening URIs with prefixes

### Setup and commands

Run the app in development mode: `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Build the app for production to the `build` folder: `npm run build`

Test the build: `serve -s build`

Build Docker image with local build: `docker build -f Dockerfile.prod -t sparqledit .`

Start Docker container: `docker run -p 3001:80 --name sparql_edit sparqledit`

### TODOs

* Algorithm
  * support for other [Graph Pattern](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#GraphPattern)
  * check restrictions (restricted SPARQL grammar -> paper)
  * editable object URIs ?
* React app
  * Bugfix: ResultTable unique keys for blank cells (<td></td>)
  * special input components for different datatypes (e.g. xsd:dateTime)
  * form validation
    * SPARQL endpoint, query syntax + restrictions
    * Input cell content
  * maybe use Yasgui components (with modifications?)
* SOLID app
  * represent saved queries (+ metadata & endpoint URLs) with RDF
  * load/store saved queries from/on SOLID POD
  * alternative if not signed in: load/store from/in BrowserDB
* Additional features/ideas
  * sub-graph visualization
  * SPARQLedit for LDP documents with internal SPARQL engine and PUT request

### Important notes

#### Mixed Content restriction

If the app is served over _HTTPS_ the browser blocks _HTTP_ requests to other websites. ([Firefox docu](https://support.mozilla.org/en-US/kb/mixed-content-blocking-firefox))

| SPARQL access | Chrome | Firefox |
|---|---|---|
| HTTPS | https://wikidata.org/sparql | https://wikidata.org/sparql |
| HTTP | X | http://ux1637:3030/test/ *if allowed by the user |
| localhost | http://localhost:3030/test/ | http://localhost:3030/test/ |
