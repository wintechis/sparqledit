import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";

const sparqlFetcher = new SparqlEndpointFetcher();

function getQueryType(queryStr) {
  return sparqlFetcher.getQueryType(queryStr);
}

async function submitQuery(sparqlUrl, queryStr) {

  const stream = await sparqlFetcher.fetchBindings(sparqlUrl, queryStr);
  
  return new Promise((resolve, reject) => {
    let data = [];
    stream.on('data', (bindings) => {
      data.push(bindings);
    });
    stream.on('end', () => {
      resolve(data);
    });
    stream.on('error', err => {
      console.error(err);
      reject(err);
    });
  });
}

async function submitUpdateQuery(sparqlUrl, queryStr) {
  await sparqlFetcher.fetchUpdate(sparqlUrl, queryStr);
  return 'SUCCESS';
}

const client = {
  getQueryType: getQueryType,
  submitQuery: submitQuery,
  submitUpdateQuery: submitUpdateQuery
};
export default client;