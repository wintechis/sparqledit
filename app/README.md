# SPARQL_edit Application

## Developer info

SPARQL_edit is a React app written in JavaScript. The styling and design is done with Bootstrap.

SPARQL_edit uses the [YASQE](https://triply.cc/docs/yasgui-api#yasqe) component from [YASGUI](https://github.com/TriplyDB/Yasgui) as query editor.
It uses different RDF-related libraries:
* [SPARQL.js](https://github.com/RubenVerborgh/SPARQL.js) for translating SPARQL queries into JS objects and back
* [fetch-sparql-endpoint.js](https://github.com/rubensworks/fetch-sparql-endpoint.js/) for sending queries to the SPARQL endpoint
* [rdf-literal.js](https://github.com/rubensworks/rdf-literal.js) for mapping RDF literals to JavaScript primitives
* [@zazuko/rdf-vocabularies](https://github.com/zazuko/rdf-vocabularies) for shortening URIs with prefixes

### Versions

* v0.2: editing RDF literal values SPARQL results
* v0.3: "SPARQL view" manager
* v0.4: simple Solid integration
* v0.5: "update log" feature
* v0.6: restricted SPARQL grammar in query editor

Upcoming versions
* v0.7: update guarantees

### Setup and commands

Install dependencies: `npm i`

Run the app in development mode: `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Build the app for production to the `build` folder: `npm run build`

Test the build: `serve -s build`

#### Bugfix for @inrupt dependency

Webpack compilation error 'Can't import the named export 'EventEmitter' from non EcmaScript module (only default export is available)'

Solution: rename/delete index.mjs in node_modules

`cd node_modules/@inrupt/solid-client-authn-core/dist/; mv index.mjs backup-index.mjs`

#### Docker

Build Docker image: `docker build -f Dockerfile.prod -t sparqledit .`

Start Docker container: `docker run -p 3001:80 --name sparql_edit sparqledit`

#### Upload to SOLID POD

Build the app for production to the `build` folder: `npm run build`

__Note:__ Use `"homepage": "."` in package.json if the app is not deployed to root.

Export SOLID credentials as environment variables: `export SOLID_USERNAME=myusername; export SOLID_PASSWORD=mypassword`

Start upload script: `npm run solid-upload`

#### Replay updates

install node-fetch library: `npm i -g node-fetch`

run the NodeJS script: `node .\docs\updatelog\replay-sparql-updates.mjs`

### TODOs

* Algorithm
  * support for named graphs (FROM NAMED)
  * support for other [Graph Pattern](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#GraphPattern)
* React app
  * validation & checking
    * SPARQL endpoint
    * query grammar restrictions
    * input cell content
    * update guarantees
  * load/save multiple view configs at the same time
  * support changing the generated update query
* SOLID
  * better UI for up-/downloading views to/from Solid Pod

__Ideas for new features__
* Editable object URIs
* View uppdate permissions/restrictions
  * define variables where updates are (not) permitted
  * integration in SPARQL view RDF model
  * HTML input controls are redndered read-only
* HTML Widgets (https://triply.cc/docs/yasgui) ?
* Graph visualization of query triple patterns
  * show edited table cell as leaf node in graph
* SPARQL_edit for RDF documents
  * using an internal SPARQL engine
  * RDF resources or LDP/Solid servers
