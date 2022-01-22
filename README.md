# SPARQL_edit

v0.2: **L**iteral **EDIT**ing with **SPARQL** (Ledit-SPARQL)
v0.3: **SPARQLview** manager
v0.4: **SPARQLview** manager + **Solid** integration

## SPARQL_edit is a Web app that facilitates the editing of RDF literal values in a Knowledge Graph

SPARQL_edit manages so-called "SPARQL views", simple configuration objects that define how to load a table of values from a Knowledge Graph. For each view, SPARQL_edit allows you to edit literal values in the table.

SPARQL_edit executes user-defined [SPARQL SELECT query](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/) and shows the results in a table. The result table displays literals as editable input fields where the user can simply change the value. 
When the changes are saved, SPARQL_edit automatically creates a [SPARQL Update query](https://www.w3.org/TR/sparql11-update/) and executes it. 
There are, however, some restrictions for the generation of the update query. This relates to the _database view update problem_.

SPARQL_edit supports simple ['SELECT' queries](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#select) on the [default graph](https://www.w3.org/TR/sparql11-query/#specifyingDataset) with a [basic graph pattern (BGP)](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#BasicGraphPatterns) that may contain 
* [blank node patterns](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#QSynBlankNodes) such as [n-ary relations](https://www.w3.org/TR/swbp-n-aryRelations/)
* one or none 'FROM' keyword for defining the default graph
* 'OPTIONAL' triple patterns
* 'FILTER' statements
* solution sequence modifier ('ORDER','LIMIT','OFFSET')

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

### Usage tips

Shortcuts for the SPARQL editor
| | |
|---|---|
| [ctrl] + [enter] | submit query |
| [ctrl] + # | comment/uncomment |
| [crtl] + [shift] + F | auto-format |
| [crtl] + Z | undo last change |
| [crtl] + Y | redo last change |
More shortcuts are in the [YASQE docs](https://triply.cc/docs/yasgui#supported-key-combinations).

Changes to input fields can be submitted with `ENTER`.

#### Default SPARQL endpoints

* Fuseki "test" dataset
  * Query/Update: [http://localhost:3030/test](http://localhost:3030/test)
  * Query: [http://localhost:3030/test/query](http://localhost:3030/test/query)
  * Update: [http://localhost:3030/test/update](http://localhost:3030/test/update)
* GraphDB "test" repository
  * Query: [http://localhost:7200/repositories/test](http://localhost:7200/repositories/test)
  * Update: [http://localhost:7200/repositories/test/statements](http://localhost:7200/repositories/test/statements)

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
    3. if subject, predicate or object is blank node, replace with variable (reasons: [1.1](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#BlankNodesInResults), [1.2](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#BGPsparqlBNodes), [2](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#grammarBNodes))
3. build update query ([delete-insert-where](https://www.w3.org/TR/sparql11-update/#deleteInsert))
    1. copy prefixes
    2. copy modified BGP triples from (2.)
    3. create 'DELETE' and 'INSERT' triple based on (2.)
    4. (optionally) copy the specified default graph ('FROM' -> 'WITH')

Example:
```
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>
SELECT ?name ?birthdate ?weight
FROM <http://localhost:3030/example/graph1>
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
WITH <http://localhost:3030/example/graph1>
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

SPARQL_edit uses the [YASQE](https://triply.cc/docs/yasgui-api#yasqe) component from [YASGUI](https://github.com/TriplyDB/Yasgui) as query editor.
It uses different RDF-related libraries:
* [SPARQL.js](https://github.com/RubenVerborgh/SPARQL.js) for translating SPARQL queries into JS objects and back
* [fetch-sparql-endpoint.js](https://github.com/rubensworks/fetch-sparql-endpoint.js/) for sending queries to the SPARQL endpoint
* [rdf-literal.js](https://github.com/rubensworks/rdf-literal.js) for mapping RDF literals to JavaScript primitives
* [@zazuko/rdf-vocabularies](https://github.com/zazuko/rdf-vocabularies) for shortening URIs with prefixes

### Setup and commands

Run the app in development mode: `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Build the app for production to the `build` folder: `npm run build`

Test the build: `serve -s build`

#### Docker

Build Docker image: `docker build -f Dockerfile.prod -t sparqledit .`

Start Docker container: `docker run -p 3001:80 --name sparql_edit sparqledit`

#### Upload to SOLID POD

Build the app for production to the `build` folder: `npm run build`

__Note:__ Use `"homepage": "."` in package.json if the app is not deployed to root.

Export SOLID credentials as environment variables: `export SOLID_USERNAME=myusername; export SOLID_PASSWORD=mypassword`

Start upload script: `npm run solid-upload`

### TODOs

* Algorithm
  * advanced support for named graphs (FROM NAMED)
  * support for other [Graph Pattern](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#GraphPattern)
  * check restrictions (restricted [SPARQL grammar](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#sparqlGrammar))
  * more features:
    * editable object URIs
    * insert missing statements (empty cells when using OPTIONAL)
    * delete statements
* React app
  * form validation
    * SPARQL endpoint, query syntax + restrictions
    * input cell content
  * load multiple view configs at the same time; save all current views
  * Refactoring
  * special input components
    * for different datatypes (e.g. xsd:time)
  * support for changing the generated update query
* SOLID app
  * save view RDF to Solid Pod
  * multiple spedit:SparqlView instances in RDF
* Additional features/ideas
  * SPARQL_edit for RDF documents using an internal SPARQL engine
    * load local RDF files, SPARQL_edit and save as RDF file
    * GET, SPARQL_edit and PUT LDP documents 

### Important notes

#### SPARQL server CORS support

SPARQL_edit can only send and receive requests if the SPARQL server supports [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

[Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/) supports CORS by default. The rules are included in Jetty's application server configuration which can be found in the file `apache-jena-fuseki-*\webapp\WEB-INF\web.xml`.

[GraphDB](https://graphdb.ontotext.com/documentation/standard/workbench-user-interface.html#id2) does _not_ support CORS by default. It can be activated with command line parameters: `-Dgraphdb.workbench.cors.enable=true`.

#### Mixed Content restriction

If the app is served over _HTTPS_ the browser blocks _HTTP_ requests to other websites. ([Firefox docu](https://support.mozilla.org/en-US/kb/mixed-content-blocking-firefox))

| SPARQL access | Chrome | Firefox |
|---|---|---|
| HTTPS | https://wikidata.org/sparql | https://wikidata.org/sparql |
| HTTP | X | http://ux1637:3030/test/ *if allowed by the user |
| localhost | http://localhost:3030/test/ | http://localhost:3030/test/ |
