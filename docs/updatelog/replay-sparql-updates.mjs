import fetch from 'node-fetch';

// ---------------------------------------------------------------------------
// SPARQL_edit updates replay script
//
// Very simple script for reapplying changes to a dataset that have been done 
// exclusively with SPARQL_edit.
// Procedure: fetch SPARQL_edit update log from the SPARQL endpoint with a 
// SPARQL Select query, iterate over the list of updates and chronologically 
// replay each update query.
//
//--- user input -------------------------------------------------------------
const SPARQL_ENDPOINT_QUERY = 'http://localhost:3030/example';
const SPARQL_ENDPOINT_UPDATE = 'http://localhost:3030/example';
const DATASET_UPDATELOG_GRAPHNAME = 'http://localhost:3030/example/updatelog';
// ---------------------------------------------------------------------------

// SPARQL Select query
const sparqlVar_time = 'exetime';
const sparqlVar_query = 'query';
const selectQuery = `
PREFIX prov:   <http://www.w3.org/ns/prov#>
PREFIX spedit: <http://iis.fraunhofer.de/sparqledit/ontology#>
SELECT * 
FROM <${DATASET_UPDATELOG_GRAPHNAME}>
WHERE {
  _:update a prov:Activity ;
    prov:endedAtTime ?${sparqlVar_time} ;
    prov:used [
      a prov:Entity ;
      spedit:updateQuery ?${sparqlVar_query}
    ] .
}
ORDER BY ASC(?exetime)
`.trim();

// fetch the update logs
console.log('\n=== replay SPARQL_edit updates ===\n')
const sparqlResult = await getQueryResultForAllUpdates();
const updateList = transformSparqlResultIntoUpdateList(sparqlResult);
console.log('Number of SPARQL_edit updates: ' + updateList.length + '\n');

// iterate over list of updates
for (let i = 0; i < updateList.length; i++) {
  const replayText = `Replay update ${i+1}/${updateList.length} from '${updateList[i].time}'`;
  process.stdout.write(replayText + ' ...');

  // re-execute the SPARQL update query
  try {
    await executeUpdateQuery(updateList[i].query);
    process.stdout.write('\r' + replayText + ' - success\n');    
  } catch (error) {
    process.stdout.write('\r' + replayText + ' - fail\n');
    console.error(`\n${error}\n`);
    break;
  }
}

async function getQueryResultForAllUpdates() {
  try {
    const response = await fetch( SPARQL_ENDPOINT_QUERY, {
      method: 'POST',
      body: selectQuery,
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json'
      }
    } );
    const sparqlResult = await response.json();
    //console.log(sparqlResult);
    return sparqlResult;
  } catch ( error ) {
    console.error( error );
  }
}

function transformSparqlResultIntoUpdateList(sparqlResult) {
  return sparqlResult['results']['bindings'].map(binding => (
    { 
      time: binding[sparqlVar_time].value,
      query: binding[sparqlVar_query].value
    }
  ));
}

async function executeUpdateQuery(query) {
  const response = await fetch( SPARQL_ENDPOINT_UPDATE, {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'application/sparql-update' }
  } );
  if (response.status >= 200 && response.status < 300) {
    return true;
  } else {
    throw new Error(`response status ${response.status}`);
  }
}