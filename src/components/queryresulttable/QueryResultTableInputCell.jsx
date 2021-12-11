import React from 'react';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Collapse from 'react-bootstrap/Collapse';
import QueryResultTableInputCellButtons from './QueryResultTableInputCellButtons';
import QueryResultTableInputCellModal from './QueryResultTableInputCellModal';
import { initialInputCellState, inputCellStateReducer } from '../../scripts/component-scripts/inputCellStateReducer';
import getInputTypeForLiteral from '../../scripts/component-scripts/inputCellDatatypeHelper';
import { QuerySubmission } from '../../scripts/QuerySubmission';
import { buildUpdateQueryForVariable, executeSelectOrUpdateQuery } from '../../scripts/sparqledit';

export default function QueryResultTableInputCell({ refreshTableCallback, sparqlSubmission, rowBinding, variable }) {
  const [modalShow, setModalShow] = React.useState(false);

  const { value: origValue, inputType, inputStep } = getInputTypeForLiteral(rowBinding[variable]);
  const initialState = initialInputCellState(sparqlSubmission, origValue);

  const [inputCellState, dispatch] = React.useReducer(inputCellStateReducer, initialState);

  async function handleLiteralUpdate(e) {
    e.preventDefault();
    if(!inputCellState.updateQuery || inputCellState.isExecutingQuery) {
      return; // no action if form is submitted in wrong state
    }
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

  const handleInputChange= (e) => {
    const newValue = String(e.target.value);
    handleChange(newValue);
  }
  const handleCheckboxChange = (e) => {
    const newValue = String(e.target.checked);
    handleChange(newValue);
  }
  const handleChange = (newValue) => {
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

  const showButtons = (inputCellState.updateQuery || inputCellState.buildingError) ? true : false;
  const anyError = (inputCellState.buildingError || inputCellState.updateError) ? true : false;
  const inputValue = inputCellState.currentCellValue ? inputCellState.currentCellValue : inputCellState.origCellValue;

  return (
    <td>
      <Form onSubmit={e => handleLiteralUpdate(e)}>
        { inputType === 'checkbox' ? 
          <Form.Check type="checkbox" onChange={e => handleCheckboxChange(e)} label={inputValue} isInvalid={anyError} ref={inputRef} checked={inputValue === 'true' ? true : false} /> :
          <Form.Control type={inputType} onChange={e => handleInputChange(e)} isInvalid={anyError} ref={inputRef} value={inputValue} step={inputStep} /> 
        }
        <Collapse in={showButtons} mountOnEnter={true} unmountOnExit={true}>
          <div>
            <QueryResultTableInputCellButtons handleLiteralUpdate={handleLiteralUpdate} handleInputReset={handleInputReset} openModal={() => setModalShow(true)} inputCellState={inputCellState} />
          </div>
        </Collapse>
        { inputCellState.updateResult ? <Badge bg="success">SUCCESS</Badge> : null }
      </Form>
      <QueryResultTableInputCellModal show={modalShow} onHide={() => setModalShow(false)} inputCellState={inputCellState} />
    </td>
  );
}