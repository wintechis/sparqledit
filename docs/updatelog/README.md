# SPARQL_edit update log feature

SPARQL_edit has a feature for logging KG updates so that they can be reapplied after a reset of the KG. 
If the user updates an RDF literal value, a log is inserted into a user-defined provenance graph. The log statements are included in the same SPARQL/Update query which changes the literal.
The log statements are modeled with [PROV-O](https://www.w3.org/TR/prov-o/) and include the update query itself, the captured execution time and optional metadata.

The KG updates of multiple SPARQL_edit users can be sorted chronologically. Following the principle of event sourcing, the states of the database can be reconstructed by adding up the saved update increments.

### Replay script

[replay-sparql-updates.mjs](replay-sparql-updates.mjs) is a simple NodeJS script that replays logged SPARQL_edit updates.

install node-fetch library: `npm i -g node-fetch`

run the NodeJS script: `node ..\docs\updatelog\replay-sparql-updates.mjs`