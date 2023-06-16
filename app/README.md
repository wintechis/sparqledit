# SPARQL_edit Application

SPARQL_edit is a React app written in JavaScript. The styling is done with Bootstrap.

SPARQL_edit uses the [YASQE](https://triply.cc/docs/yasgui-api#yasqe) component from [YASGUI](https://github.com/TriplyDB/Yasgui) as query editor.
It uses different RDF-related libraries:
* [SPARQL.js](https://github.com/RubenVerborgh/SPARQL.js) for translating SPARQL queries into JS objects and back
* [fetch-sparql-endpoint.js](https://github.com/rubensworks/fetch-sparql-endpoint.js/) for sending queries to the SPARQL endpoint
* [rdf-literal.js](https://github.com/rubensworks/rdf-literal.js) for mapping RDF literals to JavaScript primitives
* [jsonld-streaming-parser.js](https://github.com/rubensworks/jsonld-streaming-parser.js) for parsing JSON-LD
* [@zazuko/rdf-vocabularies](https://github.com/zazuko/rdf-vocabularies) for shortening URIs with prefixes

## Setup and commands

Install dependencies: `npm ci`

Run the app in development mode: `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Build the app for production into the `build` folder: `npm run build`

The generated static files can be served with any HTTP server, e.g. with
* [serve](https://www.npmjs.com/package/serve): `npm install -g serve; serve -s build`
* [http-server](https://www.npmjs.com/package/http-server): `npm install -g http-server; http-server -p 3000 build/`
* Python's [http.server](https://docs.python.org/3/library/http.server.html): `python -m http.server --directory build/ 3000`

#### Bugfix for @inrupt dependency

Webpack compilation error 'Can't import the named export 'EventEmitter' from non EcmaScript module (only default export is available)'

Solution: rename/delete index.mjs in node_modules

`cd node_modules/@inrupt/solid-client-authn-core/dist/; mv index.mjs backup-index.mjs`

## Docker

You can start the [SPARQL_edit image from Docker Hub](https://hub.docker.com/r/smeckler/sparqledit):  
`docker run -p 3001:80 --name sparql_edit smeckler/sparqledit`

Or you can build and run SPARQL_edit using the Dockerfile in the root of the repository:
1. Build Docker image: `docker build -t sparqledit .`
2. Start Docker container: `docker run -p 3001:80 --name sparql_edit sparqledit`
3. Open http://{your-hostname}:3001, e.g. [http://localhost:3001](http://localhost:3001)

## Future app improvements

* React app
  * validation & checking
    * SPARQL endpoint (accessibility and SPARQL/Update support)
    * input cell content (RDF datatype conformance)
  * load/save multiple view configs at the same time
* Solid: better UI for up-/downloading views to/from Solid Pod

### Ideas for new features
* Algorithm
  * examine support for named graphs (FROM NAMED)
* Graph visualization of query triple patterns
  * show edited table cell as leaf node in graph
* View update permissions/restrictions
  * define variables where updates are (not) permitted in the view config
  * SPARQL view ontology extension
  * HTML input controls are rendered read-only
* SPARQL_edit for RDF documents
  * using an internal SPARQL engine
  * RDF resources or LDP/Solid servers

## Licenses

© 2023 | S.Meckler | Fraunhofer IIS

The SPARQL_edit algorithm and application can be redistributed and/or modified under the terms of the [GNU Affero General Public License version 3](../LICENSE).

### List of dependency licenses

2023-06-16 v0.7.6 depth=1

| name | version | repository | summary | from package.json | from license | from readme | 
|---|---|---|---|---|---|---|
| @babel/plugin-proposal-export-default-from | 7.18.10 | https://github.com/babel/babel | MIT | MIT | MIT | 
| @babel/plugin-transform-react-jsx-self | 7.21.0 | https://github.com/babel/babel | MIT | MIT | MIT | 
| @babel/plugin-transform-react-jsx-source | 7.19.6 | https://github.com/babel/babel | MIT | MIT | MIT | 
| @babel/preset-flow | 7.21.4 | https://github.com/babel/babel | MIT | MIT | MIT | 
| @babel/register | 7.21.0 | https://github.com/babel/babel | MIT | MIT | MIT | 
| @expo/bunyan | 4.0.0 | http://github.com/trentm/node-bunyan | MIT | MIT | MIT | 
| @expo/cli | 0.6.2 | https://github.com/expo/expo | MIT | MIT |  | 
| @expo/vector-icons | 13.0.0 | https://github.com/expo/vector-icons | MIT | MIT | MIT | 
| @inrupt/solid-ui-react | 2.8.2 | https://github.com/inrupt/solid-ui-react | MIT | MIT | MIT | MIT
| @jest/create-cache-key-function | 29.5.0 | https://github.com/facebook/jest | MIT | MIT | MIT | 
| @jest/environment | 29.5.0 | (none) | MIT | MIT | MIT | 
| @react-native-community/cli | 10.2.2 | https://github.com/react-native-community/cli | MIT | MIT | MIT | 
| @react-native/assets | 1.0.0 | git@github.com:facebook/react-native | MIT | MIT |  | 
| @react-native/polyfills | 2.0.0 | git@github.com:facebook/react-native | MIT | MIT |  | 
| @zazuko/rdf-vocabularies | 2021.9.22 | https://github.com/zazuko/rdf-vocabularies | MIT | MIT | MIT | 
| anser | 1.4.10 | http://github.com/IonicaBizau/anser | MIT | MIT | MIT | 
| ast-types | 0.14.2 | http://github.com/benjamn/ast-types | MIT | MIT |  | 
| babel-core | 7.0.0-bridge.0 | (none) | MIT | MIT |  | 
| babel-plugin-module-resolver | 4.1.0 | https://github.com/tleunen/babel-plugin-module-resolver | MIT | MIT | MIT | 
| babel-plugin-react-native-web | 0.18.12 | http://github.com/necolas/react-native-web | MIT | MIT | MIT | 
| babel-preset-expo | 9.3.2 | https://github.com/expo/expo | MIT | MIT |  | 
| bindings | 1.5.0 | http://github.com/TooTallNate/node-bindings | MIT | MIT | MIT | MIT
| blueimp-md5 | 2.19.0 | http://github.com/blueimp/JavaScript-MD5 | MIT | MIT | MIT | 
| bootstrap | 5.2.3 | https://github.com/twbs/bootstrap | MIT | MIT | MIT | 
| bootstrap-icons | 1.10.4 | https://github.com/twbs/icons | MIT | MIT | MIT | MIT
| browserfs | 1.4.3 | https://github.com/jvilk/BrowserFS | MIT | MIT | MIT | MIT
| deprecated-react-native-prop-types | 3.0.1 | github:facebook/react-native-deprecated-modules | MIT | MIT |  | 
| expo | 48.0.10 | https://github.com/expo/expo | MIT | MIT |  | 
| fetch-sparql-endpoint | 2.4.1 | git@github.com:rubensworks/fetch-sparql-endpoint.js | MIT | MIT | MIT | 
| flow-parser | 0.185.2 | https://github.com/facebook/flow | MIT | MIT |  | 
| jest-environment-node | 29.5.0 | (none) | MIT | MIT | MIT | 
| jsonld-streaming-parser | 2.4.3 | git@github.com:rubensworks/streaming-jsonld-parser.js | MIT | MIT | MIT | 
| nan | 2.17.0 | http://github.com/nodejs/nan | MIT | MIT | MIT | MIT
| rdf-literal | 1.3.1 | git@github.com:rubensworks/rdf-literal.js | MIT | MIT | MIT | 
| react | 18.2.0 | https://github.com/facebook/react | MIT | MIT | MIT | 
| react-bootstrap | 2.7.3 | https://github.com/react-bootstrap/react-bootstrap | MIT | MIT | MIT | 
| react-dom | 17.0.2 | https://github.com/facebook/react | MIT | MIT | MIT | 
| react-error-boundary | 4.0.4 | https://github.com/bvaughn/react-error-boundary | MIT | MIT | MIT | 
| react-native | 0.71.6 | (none) | MIT | MIT | MIT | MIT
| react-scripts | 4.0.3 | https://github.com/facebook/create-react-app | MIT | MIT | MIT | 
| sparqljs | 3.6.2 | https://github.com/RubenVerborgh/SPARQL.js | MIT | MIT | MIT | 
| type-fest | 0.13.1 | sindresorhus/type-fest | (MIT OR CC0-1.0);MIT | (MIT OR CC0-1.0) | MIT | 
| typescript | 4.9.5 | https://github.com/Microsoft/TypeScript | Apache;Apache-2.0 | Apache-2.0 | Apache | 
| yasgui | 0.0.0 | https://github.com/TriplyDB/Yasgui | Apache;MIT |  | Apache;MIT | MIT | 