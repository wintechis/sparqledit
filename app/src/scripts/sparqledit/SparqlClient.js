import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";

class SparqlClient {

  constructor(credentials, abortController) {
    // create SparqlEndpointFetcher

    // create a custom fetch handler
    function myfetch(url, options) {
      // AbortController
      options.signal = abortController?.signal;
      
      // Basic Auth header
      if (credentials) {
        const authStr = 'Basic ' + Buffer.from(credentials.username + ':' + credentials.password, 'utf8').toString('base64');
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', authStr);
        } else { // type Object
          options.headers['Authorization'] = authStr;
        }
      }
      return fetch(url, options);
    };

    // use custom fetch handler and pass it into the new SparqlEndpointFetcher
    this.sparqlFetcher = new SparqlEndpointFetcher({
      fetch: myfetch
    });
  }

  getQueryType(queryStr) {
    return this.sparqlFetcher.getQueryType(queryStr);
  }
  
  async submitQuery(sparqlUrl, queryStr) {
  
    const stream = await this.sparqlFetcher.fetchBindings(sparqlUrl, queryStr);
    
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
  
  async submitUpdateQuery(sparqlUrl, queryStr) {
    await this.sparqlFetcher.fetchUpdate(sparqlUrl, queryStr);
    return 'SUCCESS';
  }

}

export default SparqlClient;