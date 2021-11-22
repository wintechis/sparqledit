import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";

const sparqlFetcher = new SparqlEndpointFetcher();

export async function submitQuery(sparqlUrl, queryStr) {

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

export async function submitUpdateQuery(sparqlUrl, queryStr) {
  await sparqlFetcher.fetchUpdate(sparqlUrl, queryStr);
  return 'success';
}
