import React from 'react';

import Alert from 'react-bootstrap/Alert';

import possibleErrorCauses from '../../scripts/component-scripts/possibleErrorCauses';

export default function ErrorBox({ error, isDismissible = true }) {
  const [show, setShow] = React.useState(true);
  const causeNotices = possibleErrorCauses(error);
  const alert = 
    <Alert variant="danger" onClose={isDismissible ? () => setShow(false) : null} dismissible={isDismissible}>
      <Alert.Heading>{error.name}</Alert.Heading>
      <p>{error.message}</p>
      { causeNotices.length > 0 ? <div>
          <p className="font-weight-bold mb-1">Possible causes:</p>
          <ul>{causeNotices.map( cause => <li key={cause}>{cause}</li>)}</ul>
        </div> : null }
    </Alert>;
  return show ? alert : null;
}
