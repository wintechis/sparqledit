# SPARQL_edit

The SPARQL_edit application in the [app](app/README.md) folder uses the alogrithm package from the [algorithm](algorithm/README.md) folder.

The [build](build) folder contains the built application. Section 'Setup' explains how to run the built application.

The [docs](docs) folder includes information around SPARQL_edit and provides example for tesing.


## SPARQL_edit application

SPARQL_edit is a Web application that facilitates editing RDF literal values in RDF Knowledge Graphs.

The SPARQL_edit app manages so-called "SPARQL views", simple configuration objects that define how to load a table of values from a SPARQL endpoint. For each view, SPARQL_edit allows you to edit literal values in the table of query results.

SPARQL_edit executes a user-defined [SPARQL/Select query](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/) and shows the results in a table. The result table displays RDF literals as editable input fields where the user can change the value. 
When the changes are saved, SPARQL_edit automatically creates a [SPARQL/Update query](https://www.w3.org/TR/sparql11-update/) and executes it. 

SPARQL_edit supports simple ['SELECT' queries](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#select) on the [default graph](https://www.w3.org/TR/sparql11-query/#specifyingDataset) with [basic graph patterns (BGP)](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#BasicGraphPatterns) that may contain 
* [blank node patterns](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#QSynBlankNodes) such as [n-ary relations](https://www.w3.org/TR/swbp-n-aryRelations/)
* one 'FROM' keyword for defining the default graph
* 'OPTIONAL' triple patterns
* 'FILTER' statements
* solution sequence modifier ('ORDER','LIMIT','OFFSET')

### Restrictions
There are some restrictions for the generation of the update query. The SPARQL_edit algorithm only supports a subset of the SPARQL grammar. The restricted SPARQL grammar is described in [docs/ontology-grammar](docs/ontology-grammar). Grammar definitions that differ from the [original SPARQL 1.1 grammar](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#sparqlGrammar) are listet in [/docs/ontology-grammar/sparql_grammar_diff.html](/docs/ontology-grammar/sparql_grammar_diff.html).

The algorithm is limited to SelectQueries that ...
* do not modify the selected variables ('AS')
* do not use named graphs ('FROM NAMED') and graph graph patterns ('GRAPH')
* do not use 'GROUP BY' or 'HAVING' solution modifiers
* do not have sub-queries
* do not use graph patterns other than normal triple patterns, optional graph patterns and filters
* do not modify values with variable bindings ('BIND') or aggregation ('COUNT', 'MIN', etc.)
* do not include RDF containers and collections
* do not use property paths


## Setup

__Live-Version: [sparqledit.netlify.app](https://sparqledit.netlify.app/)__

The folder [build](build) contains the built application. The static files can be served with any HTTP server.

* With NodeJS, [http-server](https://www.npmjs.com/package/http-server) can be used for serving local files.
  * installation: `npm install --global http-server`
  * start http-server (on port 8080; in the [build](build) folder): `http-server -p 8080 build/`
  * open [localhost:8080](http://localhost:8080/) in your browser
* With Python, [http.server](https://docs.python.org/3/library/http.server.html) can be used: `python -m http.server --directory build/ 8080`


## Usage tips

Shortcuts for the query editor (based on [YASGUI](https://triply.cc/docs/yasgui#sparql-editor))

| keys | command |
|---|---|
| [ctrl] + [enter] | submit query |
| [ctrl] + # | comment/uncomment |
| [crtl] + [shift] + F | auto-format |
| [crtl] + Z | undo last change |
| [crtl] + Y | redo last change |

Changes to input fields can be submitted with `ENTER`.

There are performance issues when loading more than 100000 results. Use the SPARQL 'LIMIT' solution modifier to limit the number of result rows (e.g. 'LIMIT 1000').

### SPARQL server CORS support

SPARQL_edit can only send requests if the SPARQL server supports [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

[Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/) supports CORS by default. The rules are included in Jetty's application server configuration which can be found in the file `apache-jena-fuseki-*\webapp\WEB-INF\web.xml`.

[GraphDB](https://graphdb.ontotext.com/documentation/standard/workbench-user-interface.html#id2) does _not_ support CORS by default. It can be activated with command line parameters: `-Dgraphdb.workbench.cors.enable=true`.

### Mixed Content restriction

If the app is served over _HTTPS_ the browser blocks _HTTP_ requests to other websites. ([Firefox docu](https://support.mozilla.org/en-US/kb/mixed-content-blocking-firefox))

|  | SPARQL URL | Allowed ? |
|---|---|---|
| HTTPS | https://example.org/store/sparql | Yes |
| HTTP  | http://ux1637:3030/example/sparql | No (only if explicitly allowed, see below) |
| localhost | http://localhost:3030/example/sparql | Yes |

Disable 'Mixed Content' blocking for a certain web page:
* Chrome
  * click on lock symbol next to URL -> show website information
  * website settings -> allow "unsafe content"
* Firefox
  * click on lock symbol next to URL -> "Firefox has blocked parts of this page that are not secure" 
  * click on "Connection secure" -> "Disable protection for now"

#### Default SPARQL endpoints for Jena Fuseki and GraphDB

* Jena Fuseki "test" dataset
  * Query/Update: [http://localhost:3030/test](http://localhost:3030/test)
  * Query: [http://localhost:3030/test/query](http://localhost:3030/test/query)
  * Update: [http://localhost:3030/test/update](http://localhost:3030/test/update)
* GraphDB "test" repository
  * Query: [http://localhost:7200/repositories/test](http://localhost:7200/repositories/test)
  * Update: [http://localhost:7200/repositories/test/statements](http://localhost:7200/repositories/test/statements)