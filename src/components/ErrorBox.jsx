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
    if (error.message.indexOf('404') > -1) {
      causeNotices.push('Wrong SPARQL endpoint URL');
    }
    if (error.message.indexOf('401') > -1) {
      causeNotices.push('The SPARQL endpoint requires authentication (e.g. username/password)');
    }
    if (error.message.toLowerCase().indexOf('failed to fetch') > -1) {
      causeNotices.push('The SPARQL server does not support CORS requests');
    }
    if (error.message.toLowerCase().indexOf('unknown sparql results content type') > -1) {
      causeNotices.push('The given URL is not a valid SPARQL endpoint');
    }
    if (error.message.toLowerCase().indexOf('parse error') > -1) {
      causeNotices.push('The submitted SPARQL query contains a syntax error. Please check if there is a red hint in the query box.');
      causeNotices.push('A grammar mistake in the SPARQL query');
    }
  }
  return causeNotices;
}