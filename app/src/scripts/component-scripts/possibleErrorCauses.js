import { 
  QueryError, 
  BuildingError, 
  UpdateError,
  UpdateCheckError,
  SolidError 
} from '../CustomErrors';

export default function possibleErrorCauses(error) {
  let causeNotices = [];

  if (error instanceof QueryError) {
    if (error.message.includes('404')) {
      causeNotices.push('Wrong SPARQL endpoint URL');
    }
    if (error.message.includes('401')) {
      causeNotices.push('The SPARQL endpoint requires authentication (e.g. username/password)');
    }
    if (error.message.toLowerCase().includes('failed to fetch') ||
      error.message.toLowerCase().includes('networkerror')) {
      if (error.endpointQuery && error.endpointQuery.length > 1) {
        const httpLocalhostRegex = /^http:\/\/localhost[:/]/ig;
        const isHTTPLocalhostQueryURL = httpLocalhostRegex.test(error.endpointQuery);
        const isHTTPQueryURL = error.endpointQuery.toLowerCase().startsWith('http://');
        const isHTTPSAppURL = window.location.href.startsWith('https://');
        if (!isHTTPLocalhostQueryURL && isHTTPQueryURL && isHTTPSAppURL) {
          causeNotices.push('Unencrypted HTTP requests from HTTPS websites are blocked by the browser');
        }
      }
      causeNotices.push('The SPARQL server does not support CORS requests');
      causeNotices.push('The SPARQL endpoint requires authentication (e.g. username/password)');
      causeNotices.push('Wrong SPARQL endpoint URL');
    }
    if (error.message.toLowerCase().includes('unknown sparql results content type')) {
      causeNotices.push('The given URL is not a valid SPARQL endpoint');
    }
    if (error.message.toLowerCase().includes('parse error')) {
      causeNotices.push('The submitted SPARQL query contains a syntax/grammar error. Please check if there is a red hint in the query box.');
      causeNotices.push('A grammar mistake in the SPARQL query');
    }
  }

  if (error instanceof UpdateError) {
    if (error.message.includes('404')) {
      causeNotices.push('Wrong SPARQL update endpoint URL');
    }
    if (error.message.includes('415') ||
      error.message.includes('405')) {
      causeNotices.push('The given update URL is not a valid SPARQL update endpoint');
    }
    if (error.message.includes('401') ||
      error.message.toLowerCase().includes('failed to fetch')) {
      causeNotices.push('Wrong SPARQL update endpoint URL');
      causeNotices.push('The SPARQL endpoint requires authentication (e.g. username/password)');
    }
  }

  if (error instanceof UpdateCheckError) {
    if (error.message.toLowerCase().includes('ineffective')) {
      causeNotices.push('RDF literal value has been changed in the meantime');
      causeNotices.push('Connected RDF triples have been modified in the meantime');
    }
    if (error.message.toLowerCase().includes('ambiguous')) {
      causeNotices.push('The generated update would affect more than one RDF triple');
    }
  }

  if (error instanceof BuildingError) {
    causeNotices.push('An unsupported SPARQL language feature was used in the original query');
  }

  if (error instanceof SolidError) {
    if (error.message.includes('403')) {
      causeNotices.push('You have insufficient rights for this operation on the Solid Pod');
    }
    if (error.message.includes('404')) {
      causeNotices.push('The is no file/container with the given URL on the Solid Pod');
    }
  }

  return causeNotices;
}