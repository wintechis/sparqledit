import React from 'react';
import Alert from 'react-bootstrap/Alert';

export default function ErrorBox({ error }) {
  const [show, setShow] = React.useState(true);

  const alert = 
    <Alert variant="danger" onClose={() => setShow(false)} dismissible>
      <Alert.Heading>{error.name}</Alert.Heading>
      <p>{error.message}</p>
    </Alert>;
  return show ? alert : null;
}