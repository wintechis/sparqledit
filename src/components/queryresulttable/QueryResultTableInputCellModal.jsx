import React from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { BuildingError, UpdateError } from '../../scripts/CustomErrors';

export default function QueryResultTableInputCellModal({ show, onHide, inputCellState }) {

  const anyError = inputCellState.buildingError || inputCellState.updateError;

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header className={anyError ? 'alert-danger' : ''} closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          SPARQL update {anyError ? 'error' : 'information'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={anyError ? 'alert-danger' : ''}>
        { inputCellState.updateQuery ?
          <Form>
            <Form.Group className="mb-3" controlId="formSparqlUpdateQuery">
              <Form.Label>Auto-generated update query</Form.Label>
              <Form.Control as="textarea" rows={6} defaultValue={inputCellState.updateQuery} />
            </Form.Group>
          </Form>
         : null }
        { inputCellState.buildingError ? <UpdateInfoModalError errorTitle={'Update query generation error'} errorObject={inputCellState.buildingError} />  : null }
        { inputCellState.updateError ? <UpdateInfoModalError errorTitle={'Update execution error'} errorObject={inputCellState.updateError} />  : null }
      </Modal.Body>
    </Modal>
  );
}

function UpdateInfoModalError({ errorTitle, errorObject }) {
  let causeNotices = [];
  if (errorObject instanceof BuildingError) {
    causeNotices.push('An unsupported SPARQL language feature was used in the original query');
  }
  if (errorObject instanceof UpdateError) {
    if (errorObject.message.includes('404')) {
      causeNotices.push('Wrong SPARQL update endpoint URL');
    }
    if (errorObject.message.includes('415')) {
      causeNotices.push('The given update URL is not a valid SPARQL update endpoint');
    }
    if (errorObject.message.includes('401') ||
      errorObject.message.toLowerCase().includes('failed to fetch')) {
      causeNotices.push('The SPARQL endpoint requires authentication (e.g. username/password)');
    }
  }

  return (
    <Alert variant="light">
      <h4>{errorTitle}</h4>
      <p>{`${errorObject.name} - ${errorObject.message}`}</p>
      { causeNotices.length > 0 ? <div>
          <p className="font-weight-bold mb-1">Possible causes:</p>
          <ul>{causeNotices.map( cause => <li key={cause}>{cause}</li>)}</ul>
        </div> : null }
    </Alert>   
  );
}