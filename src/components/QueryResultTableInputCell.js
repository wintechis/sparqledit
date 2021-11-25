import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { fromRdf } from 'rdf-literal';
import { buildUpdateQueryForVariable, executeSelectOrUpdateQuery } from '../scripts/sparqledit';
import QuerySubmission from '../scripts/QuerySubmission';

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
        origValue = origValue.toISOString().substring(0,10); // no time
      }
      break;
    default:
  }
  const initialInputCellStateState = {
    origSparqlSubmission: sparqlSubmission,
    origCellValue: origValue,
    currentCellValue: null,
    buildingError: null,
    updateQuery: null,
    updateResult: null,
    updateError: null,
    isExecutingQuery: false
  };
  const [inputCellState, dispatch] = React.useReducer(inputCellStatehReducer, initialInputCellStateState);

  async function handleLiteralUpdate(e) {
    e.preventDefault();
    dispatch({ type: "INPUTCELL_UPDATE_START" });
    try {
      const updateSubmission = new QuerySubmission(
        inputCellState.origSparqlSubmission.endpointQuery, 
        inputCellState.origSparqlSubmission.endpointUpdate, 
        inputCellState.updateQuery);
      const updateResult = await executeSelectOrUpdateQuery(updateSubmission);
      if(updateResult === 'SUCCESS') {
        refreshTableCallback(inputCellState.origSparqlSubmission); // redo query and reload complete table
        // dispatch({
        //   type: "INPUTCELL_UPDATE_SUCCESS",
        //   result: updateResult,
        // });
      } else {
        dispatch({
          type: "INPUTCELL_UPDATE_FAIL",
          error: new Error('update result not successful')
        });
      }
    } catch (error) {
      dispatch({
        type: "INPUTCELL_UPDATE_FAIL",
        error
      });
    }
  };

  const handleInputChange = (e) => {
    const newValue = String(e.target.value);
    const buildUpdateQuery = () => {
      rowBinding[variable].valueNew = String(newValue);
      const updateQu = buildUpdateQueryForVariable(sparqlSubmission.queryString, rowBinding);
      return updateQu;
    }
    dispatch({
      type: "INPUTCELL_CHANGE",
      currentCellValue: newValue,
      buildUpdateQuery: buildUpdateQuery
    });
  };

  const handleInputReset = (e) => {
    inputRef.current.focus();
    dispatch({
      type: "INPUTCELL_RESET"
    });
  };
  const inputRef = React.useRef(null);

  const anyError = inputCellState.buildingError || inputCellState.updateError;
  const inputValue = inputCellState.currentCellValue ? inputCellState.currentCellValue : inputCellState.origCellValue;
  return (
    <td>
      <Form>
        <Form.Control type={inputType} onChange={e => handleInputChange(e)} isInvalid={anyError} ref={inputRef} value={inputValue} />
        { inputCellState.updateQuery || inputCellState.buildingError ?
          <ButtonGroup aria-label="update controls" className="mt-1">
            <Button variant="success" type="submit" alt="update" onClick={e => handleLiteralUpdate(e)} disabled={inputCellState.isExecutingQuery || inputCellState.buildingError}>
              { inputCellState.isExecutingQuery ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> saving …</> : <span><i className="bi bi-pencil-square"></i> save </span>}
            </Button>
            <Button variant="secondary" type="reset" onClick={e => handleInputReset(e)} disabled={inputCellState.isExecutingQuery}>
              <i className="bi bi-arrow-counterclockwise"></i> reset
            </Button>
            { anyError ?
              <Button variant="danger" onClick={() => setModalShow(true)} disabled={inputCellState.isExecutingQuery}>
                <i className="bi bi-x-square"></i> error
              </Button> :
              <Button variant="primary" onClick={() => setModalShow(true)} disabled={inputCellState.isExecutingQuery}>
                <i className="bi bi-info-square"></i> info
              </Button> }
          </ButtonGroup>
          : null }
        { inputCellState.updateResult ? <Badge bg="success">SUCCESS</Badge> : null }

      </Form>
      <UpdateInfoModal show={modalShow} onHide={() => setModalShow(false)} inputCellState={inputCellState} />
    </td>
  );
}

function UpdateInfoModal({ show, onHide, inputCellState}) {
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
      {/* <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer> */}
    </Modal>
  );
}

function UpdateInfoModalError({ errorTitle, errorObject }) {
  return (
    <Alert variant="light">
      <h4>{errorTitle}</h4>
      <p>{`${errorObject.name} - ${errorObject.message}`}</p>
    </Alert>   
  );
}

function inputCellStatehReducer(state, action) {
  switch (action.type) {
    
    case "INPUTCELL_CHANGE":
      const newState = { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue,
      };
      // eslint-disable-next-line
      if (action.currentCellValue != state.origCellValue) {
        newState.currentCellValue = action.currentCellValue
        try {
          const updateQu = action.buildUpdateQuery();
          newState.updateQuery = updateQu;
        } catch (error) {
          newState.updateQuery = null;
          newState.buildingError = error;
        }
      }
      return newState;

    case "INPUTCELL_RESET":
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue 
      };

    case "INPUTCELL_UPDATE_START":
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue,
        currentCellValue: state.currentCellValue,
        updateQuery: state.updateQuery,
        isExecutingQuery: true
      };

    case "INPUTCELL_UPDATE_SUCCESS":
      // wrong state/value if update successful but no effect
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.currentCellValue,
        updateResult: action.result,
        isExecutingQuery: false
      };
      
    case "INPUTCELL_UPDATE_FAIL":
      return { 
        origSparqlSubmission: state.origSparqlSubmission, 
        origCellValue: state.origCellValue,
        currentCellValue: state.currentCellValue,
        updateQuery: state.updateQuery,
        updateError: action.error,
        isExecutingQuery: false
      };

    default:
      throw new Error(`Invalid reducer action: ${action.type}`);
  }
}