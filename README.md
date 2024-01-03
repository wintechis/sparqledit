# SPARQL_edit

SPARQL_edit is a Web application that facilitates editing RDF literal values in RDF Knowledge Graphs.

* :globe_with_meridians: __[Online version](https://wintechis.github.io/sparqledit/)__
  * user: bob / bobpw
* :information_source: __[Tutorial](docs/tutorial/TUTORIAL.md)__
* :whale: __[Docker](https://hub.docker.com/r/smeckler/sparqledit)__

The SPARQL_edit application in the [app](app) folder uses the alogrithm package from the [algorithm](algorithm) folder.

Instructions for building the application are described in the app's [README](app/README.md). The [docs](docs) folder includes information around SPARQL_edit and examples for testing.


## What is SPARQL_edit and how does it work?

SPARQL_edit is a React application that can be connected to SPARQL endpoints and helps to edit RDF literal values in the underlying RDF data.

The SPARQL_edit app manages so-called "SPARQL views", simple configuration objects that define how to load a table of values from a SPARQL endpoint. For each view, SPARQL_edit allows you to edit literal values in the table of query results.

SPARQL_edit executes a user-defined [SPARQL/Select query](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/) and shows the results in a table. The result table displays RDF literals as editable input fields where the user can change the value. 
When the changes are saved, a view-update algorithm automatically creates a [SPARQL/Update query](https://www.w3.org/TR/sparql11-update/) which is used to update the specific value in the RDF graph. 

For the defintion of a "SPARQL view", SPARQL_edit supports simple ['SELECT' queries](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#select) on the [default graph](https://www.w3.org/TR/sparql11-query/#specifyingDataset) with [basic graph patterns (BGP)](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#BasicGraphPatterns) that may contain 
* [blank node patterns](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#QSynBlankNodes) such as [n-ary relations](https://www.w3.org/TR/swbp-n-aryRelations/),
* one 'FROM' keyword for defining the default graph,
* 'OPTIONAL' triple patterns,
* 'FILTER' statements and
* solution sequence modifiers ('ORDER','LIMIT','OFFSET').

### Restrictions
The view-update algorithm can only generate correct updates for "translatable" views. Therefore, SPARQL_edit algorithm restricts the view definition with SPARQL to a subset of the SPARQL grammar. Unsupported SPARQL features are treated like wrong syntax or grammar inside the query editor (YASQE) of the app. A correct query which conforms to the SPARQL 1.1 specification might be labeled invalid because it uses language features that are not supported by the view-update algorithm. SPARQL_edit allows for the execution of possibly invalid queries and tries to display the results although the literal update feature won't work in this case.

The restricted SPARQL grammar is described in [docs/ontology-grammar](docs/ontology-grammar). Grammar definitions that differ from the [original SPARQL 1.1 grammar](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#sparqlGrammar) are listet in [/docs/ontology-grammar/sparql_grammar_diff.html](/docs/ontology-grammar/sparql_grammar_diff.html).

The algorithm is limited to SelectQueries that ...
* do not modify the selected variables ('AS')
* do not use named graphs ('FROM NAMED') and graph graph patterns ('GRAPH')
* do not use 'GROUP BY' or 'HAVING' solution modifiers
* do not have sub-queries
* do not use graph patterns other than normal triple patterns, optional graph patterns and filters
* do not modify values with variable bindings ('BIND') or aggregation ('COUNT', 'MIN', etc.)
* do not include RDF containers and collections
* do not use property paths


## Usage tips

There are performance issues when loading more than 50000 results. Please use the SPARQL 'LIMIT' solution modifier to limit the number of result rows (e.g. 'LIMIT 10000').

Shortcuts for the query editor

| keys | command |
|---|---|
| [ctrl] + [space] | autocomplete |
| [ctrl] + # | comment/uncomment |
| [crtl] + [shift] + F | auto-format |
| [crtl] + Z | undo last change |
| [crtl] + Y | redo last change |

Changes to input fields can be submitted with `ENTER`.

### SPARQL server CORS support

SPARQL_edit can only send requests if the SPARQL server supports [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

[Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/) supports CORS by default. The rules are included in Jetty's application server configuration which can be found in the file `apache-jena-fuseki-*\webapp\WEB-INF\web.xml`.

[GraphDB](https://graphdb.ontotext.com/documentation/standard/workbench-user-interface.html#id2) does _not_ support CORS by default. It can be activated with command line parameters: `-Dgraphdb.workbench.cors.enable=true`.

### Mixed Content restriction

If the app is served over _HTTPS_ the browser blocks _HTTP_ requests to other websites. ([Firefox docu](https://support.mozilla.org/en-US/kb/mixed-content-blocking-firefox))

|  | SPARQL URL | Allowed ? |
|---|---|---|
| HTTPS | https://example.org/store/sparql | Yes |
| HTTP  | http://example.org/example/sparql | No (only if explicitly allowed, see below) |
| localhost | http://localhost:3030/example/sparql | Yes |

Disable 'Mixed Content' blocking for a certain web page:
* Chrome
  * click on lock symbol next to URL -> show website information
  * website settings -> allow "unsafe content"
* Firefox
  * click on lock symbol next to URL -> "Firefox has blocked parts of this page that are not secure" 
  * click on "Connection secure" -> "Disable protection for now"


## License

© 2023 | S.Meckler | Fraunhofer IIS

The SPARQL_edit algorithm and application can be redistributed and/or modified under the terms of the [GNU Affero General Public License version 3 (AGPL-3.0)](LICENSE).

#### Citation

Meckler, S., Harth, A. (2023). SPARQL_edit: Editing RDF Literals in Knowledge Graphs via View-Update Translations. In: Payne, T.R., et al. The Semantic Web – ISWC 2023. ISWC 2023. Lecture Notes in Computer Science, vol 14266. Springer, Cham. https://doi.org/10.1007/978-3-031-47243-5_10

#### Acknowledgments 

This work was funded by the Bavarian State Ministry of Economic Affairs and Media, Energy and Technology within the research program "Information and Communication Technology" (grant no. DIK0134/01).
