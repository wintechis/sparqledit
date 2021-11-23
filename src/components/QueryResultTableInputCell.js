import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';
import { fromRdf } from 'rdf-literal';
import { buildUpdateQueryForVariable, executeUpdateQuery } from '../scripts/sparqledit';


export default function QueryResultTableInputCell({ refreshTableCallback, sparqlSubmission, rowBinding, variable }) {
  const [modalShow, setModalShow] = React.useState(false);

  const binding = rowBinding[variable];
  let origValue = fromRdf(binding);
  let inputType = 'text';
  switch (typeof(origValue)) {
    case 'number':
      inputType = 'number';
      break;
    case 'object':
      if(origValue instanceof Date) {
        inputType = 'date';
        origValue = origValue.toISOString().substring(0,10);
      }
      break;
    default:
  }

  const [currentValue, setCurrentValue] = React.useState(origValue);
  const [updateQuery, setUpdateQuery] = React.useState();
  const [updateResult, setUpdateResult] = React.useState();

  async function handleLiteralUpdate(e) {
    e.preventDefault();
    const updateResult = await executeUpdateQuery(sparqlSubmission.endpointUpdate, updateQuery);
    setUpdateResult(updateResult);
    if(updateResult === 'success') {
      setUpdateQuery(null);
      refreshTableCallback(sparqlSubmission);
    }
  };

  const handleInputChange = (e) => {
    const newValue = String(e.target.value);
    setCurrentValue(newValue);
    rowBinding[variable].valueNew = String(newValue);
    console.log(rowBinding);
    const updateQu = buildUpdateQueryForVariable(sparqlSubmission.queryString, rowBinding);
    setUpdateQuery(updateQu);
  };

  const handleInputReset = (e) => {
    e.preventDefault();
    setCurrentValue(origValue);
    setUpdateQuery(null);
  };
  
  return (
    <td>
      <Form>
        <Form.Control type={inputType} value={currentValue} onChange={e => handleInputChange(e)} />
        { updateQuery ?
          <ButtonGroup aria-label="update controls" className="mt-1">
            <Button variant="success" type="submit" alt="update" onClick={e => handleLiteralUpdate(e)}>
              <i className="bi bi-pencil-square"></i> save 
            </Button>
            <Button variant="secondary" type="reset" onClick={e => handleInputReset(e)}>
              <i className="bi bi-x-lg"></i> reset
            </Button>
            <Button variant="primary" onClick={() => setModalShow(true)}>
              <i className="bi bi-info-square"></i> info
            </Button>
          </ButtonGroup>
          : null }
        { updateResult ? <Badge bg="success">{updateResult}</Badge> : null }
      </Form>
      <UpdateInfoModal show={modalShow} onHide={() => setModalShow(false)} sparqlUpdateQuery={updateQuery} />
    </td>
  );
}

function UpdateInfoModal({ show, onHide, sparqlUpdateQuery}) {

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          SPARQL update query
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formSparqlUpdateQuery">
            <Form.Label>Auto-generated update query</Form.Label>
            <Form.Control as="textarea" rows={6} defaultValue={sparqlUpdateQuery} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}