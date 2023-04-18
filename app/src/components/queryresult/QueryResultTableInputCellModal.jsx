import React from 'react';

import '../../styles/component-styles/QueryResultTableInputCellModal.css';

import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

import { DataChangeUpdateCheckError } from '../../scripts/CustomErrors';
import possibleErrorCauses from '../../scripts/component-scripts/possibleErrorCauses';

const TEXTAREA_ROWS_MIN = 4;
const TEXTAREA_ROWS_MAX = 10;

export default function QueryResultTableInputCellModal({ show, onHide, inputCellState }) {

  const anyError = inputCellState.buildingError || inputCellState.updateCheckError || inputCellState.updateError;
  const isDataChanged = inputCellState.updateCheckError instanceof DataChangeUpdateCheckError;

  let textareaRows = TEXTAREA_ROWS_MIN;
  if (inputCellState.updateQuery) {
    const numberOfLines = inputCellState.updateQuery.split(/\r\n|\r|\n/).length;
    textareaRows = Math.max(TEXTAREA_ROWS_MIN, Math.min(numberOfLines + 1, TEXTAREA_ROWS_MAX));
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" dialogClassName="modal-90w" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header className={anyError ? (isDataChanged ? 'alert-warning' : 'alert-danger') : ''} closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          SPARQL update {anyError ? (isDataChanged ? 'warning' : 'error') : 'information'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={anyError ? (isDataChanged ? 'alert-warning' : 'alert-danger') : ''}>
        { inputCellState.buildingError ? <UpdateInfoModalError errorTitle={'Update query generation error'} errorObject={inputCellState.buildingError} />  : null }
        { inputCellState.updateCheckError ? <UpdateInfoModalError errorTitle={'Update preflight check'} errorObject={inputCellState.updateCheckError} />  : null }
        { inputCellState.updateError ? <UpdateInfoModalError errorTitle={'Update execution error'} errorObject={inputCellState.updateError} />  : null }
        { inputCellState.updateQuery ?
          <Form>
            <Form.Group className="mb-3" controlId="formSparqlUpdateQuery">
              <Form.Label>Auto-generated update query</Form.Label>
              <Form.Control as="textarea" rows={textareaRows} defaultValue={inputCellState.updateQuery} className="white-readonly" readOnly />
            </Form.Group>
          </Form>
         : null }
      </Modal.Body>
    </Modal>
  );
}

function UpdateInfoModalError({ errorTitle, errorObject }) {
  let causeNotices = possibleErrorCauses(errorObject);

  return (
    <>
      <p>{errorTitle}</p>
      <Alert variant="light">
        <p>{`${errorObject.name} - ${errorObject.message}`}</p>
        {causeNotices.length > 0 ? <div>
          <p className="font-weight-bold mb-1">Possible causes:</p>
          <ul>{causeNotices.map(cause => <li key={cause}>{cause}</li>)}</ul>
        </div> : null}
      </Alert>
    </>
  );
}