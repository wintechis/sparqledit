import React from 'react';
import Alert from 'react-bootstrap/Alert';
import { QueryError } from '../scripts/CustomErrors';

export default function ErrorBox({ error }) {
  const [show, setShow] = React.useState(true);

  const causeNotices = getPossibleCauses(error);

  const alert = 
    <Alert variant="danger" onClose={() => setShow(false)} dismissible>
      <Alert.Heading>{error.name}</Alert.Heading>
      <p>{error.message}</p>
      { causeNotices.length > 0 ? <div>
          <p className="font-weight-bold mb-1">Possible causes:</p>
          <ul>{causeNotices.map( cause => <li key={cause}>{cause}</li>)}</ul>
        </div> : null }
    </Alert>;
  return show ? alert : null;
}

function getPossibleCauses(error) {
  let causeNotices = [];
  if (error instanceof QueryError) {
    if (error.message.includes('404')) {
      causeNotices.push('Wrong SPARQL endpoint URL');
    }
    if (error.message.includes('401')) {
      causeNotices.push('The SPARQL endpoint requires authentication (e.g. username/password)');
    }
    if (error.message.toLowerCase().indexOf('failed to fetch') > -1) {
      if (error.endpointQuery && error.endpointQuery.length > 1) {
        const httpLocalhostRegex = /^http:\/\/localhost[:\/]/ig;
        const isHTTPLocalhostQueryURL = httpLocalhostRegex.test(error.endpointQuery);
        const isHTTPQueryURL = error.endpointQuery.toLowerCase().startsWith('http://');
        const isHTTPSAppURL = window.location.href.startsWith('https://');
        if (!isHTTPLocalhostQueryURL && isHTTPQueryURL && isHTTPSAppURL) {
          causeNotices.push('Unencrypted HTTP requests from HTTPS websites are blocked by the browser');
        }
      }
      causeNotices.push('The SPARQL server does not support CORS requests');
    }
    if (error.message.toLowerCase().includes('unknown sparql results content type')) {
      causeNotices.push('The given URL is not a valid SPARQL endpoint');
    }
    if (error.message.toLowerCase().includes('parse error')) {
      causeNotices.push('The submitted SPARQL query contains a syntax error. Please check if there is a red hint in the query box.');
      causeNotices.push('A grammar mistake in the SPARQL query');
    }
  }
  return causeNotices;
}