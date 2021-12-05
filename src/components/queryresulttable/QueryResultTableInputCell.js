import React from 'react';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Collapse from 'react-bootstrap/Collapse';
import QueryResultTableInputCellButtons from './QueryResultTableInputCellButtons';
import QueryResultTableInputCellModal from './QueryResultTableInputCellModal';
import { QuerySubmission } from '../../scripts/QuerySubmission';
import { fromRdf } from 'rdf-literal';
import { buildUpdateQueryForVariable, executeSelectOrUpdateQuery } from '../../scripts/sparqledit';

export default function QueryResultTableInputCell({ refreshTableCallback, sparqlSubmission, rowBinding, variable }) {
  const [modalShow, setModalShow] = React.useState(false);

  const binding = rowBinding[variable];
  const { value: origValue, inputType, inputStep } = getInputTypeForLiteral(binding);

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

function getInputTypeForLiteral(binding) {
  const bindingDatatype = binding.datatype.value.toLowerCase();
  let origValue = fromRdf(binding);
  let inputType = 'text';
  let inputStep = null;
  switch (typeof(origValue)) {
    case 'number':
      inputType = 'number';
      break;
    case 'boolean':
      inputType = 'checkbox';
      origValue = String(origValue);
      break;
    case 'object':
      if(origValue instanceof Date) {
        if (bindingDatatype.endsWith('#date')) {
          origValue = origValue.toISOString().substring(0,10); // only date
          inputType = 'date';
        } else if (bindingDatatype.endsWith('#datetime')) {
          const timezoneOffset = origValue.getTimezoneOffset() * 60000;
          const correctedTime = new Date(origValue.getTime() - timezoneOffset);
          origValue = correctedTime.toISOString().substring(0,19); // only date+time
          inputType = 'datetime-local';
          inputStep = 1;
        }
      }
      break;
    default:
  }
  return {
    value: origValue,
    inputType,
    inputStep
  };
}