import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import QueryResultTableInputCellButtons from './QueryResultTableInputCellButtons';
import QueryResultTableInputCellModal from './QueryResultTableInputCellModal';
import { initialInputCellState, inputCellStateReducer } from '../../scripts/component-scripts/inputCellStateReducer';
import getInputTypeForLiteral from '../../scripts/component-scripts/inputCellDatatypeHelper';
import { QuerySubmission } from '../../scripts/models/QuerySubmission';
import {
  buildCheckQueryForVariable,
  buildUpdateQueryForVariable, 
  buildUpdateLogQueryForVariable, 
  executeSelectOrUpdateQuery 
} from '../../scripts/sparqledit/sparqledit';

export default function QueryResultTableInputCell({ refreshTableCallback, isRefreshing, sparqlSubmission, rowBinding, variable, insertMode = false, sparqlView }) {
  const [showInput, setShowInput] = React.useState(false);
  
  if (insertMode) {
    return (
      <td className="align-middle">
        { !showInput && 
          <Button variant="link" className="text-secondary" onClick={() => setShowInput(true)} disabled={isRefreshing}>
            <small>insert missing value</small>
          </Button>
        }
        { showInput &&
          <QueryResultTableInputCellInput  
            refreshTableCallback={refreshTableCallback} 
            isRefreshing={isRefreshing}
            sparqlSubmission={sparqlSubmission} 
            rowBinding={rowBinding} 
            variable={variable} 
            insertMode={true}
            insertModeReset={() => setShowInput(false)}
            sparqlView={sparqlView} /> 
        }
      </td>
    );
  } else {
    return (
      <td className="align-middle">
        <QueryResultTableInputCellInput 
          refreshTableCallback={refreshTableCallback} 
          isRefreshing={isRefreshing}
          sparqlSubmission={sparqlSubmission} 
          rowBinding={rowBinding} 
          variable={variable} 
          insertMode={insertMode}
          sparqlView={sparqlView} />
      </td>
    );
  }
}

function QueryResultTableInputCellInput({ refreshTableCallback, isRefreshing, sparqlSubmission, rowBinding, variable, insertMode, insertModeReset, sparqlView }) {
  const [modalShow, setModalShow] = React.useState(false);
  const { error: datatypeError, value: origValue, inputType, inputStep, language } = getInputTypeForLiteral(rowBinding[variable]);
  const initialState = initialInputCellState(sparqlSubmission, origValue);

  const [inputCellState, dispatch] = React.useReducer(inputCellStateReducer, initialState);

  async function handleLiteralUpdate(e) {
    e.preventDefault();
    if(!inputCellState.updateQuery || inputCellState.isExecutingQuery) {
      return; // no action if form is submitted in wrong state
    }
    dispatch({ type: "INPUTCELL_UPDATE_START" });

    // update check
    try {
      const checkSubmission = new QuerySubmission(
        inputCellState.origSparqlSubmission.endpointQuery, 
        inputCellState.origSparqlSubmission.endpointUpdate, 
        inputCellState.checkQuery,
        inputCellState.origSparqlSubmission.credentials);
      console.log('inputCellState.checkQuery', inputCellState.checkQuery);
      const checkQueryResult = await executeSelectOrUpdateQuery(checkSubmission);
      console.log('checkQueryResult', checkQueryResult);
      // 0 solutions: graph pattern matching has no result
      // the relevant triples in the graph have been changed in the meantime
      if(checkQueryResult.length === 0) {
        return dispatch({
          type: "INPUTCELL_UPDATECHECK_FAIL",
          error: new Error('ineffective update query')
        });
      } 
      // >1 solutions: graph pattern matches more than one times
      // ambiguous update query that would alter more than one triple
      else if(checkQueryResult.length > 1) {
        return dispatch({
          type: "INPUTCELL_UPDATECHECK_FAIL",
          error: new Error('ambiguous update query')
        });
      }
      // 1 solution: ideal case
      // update query is safe
      else if(checkQueryResult.length === 1) {
        console.log('successful update query check');
      }
      else {
        throw new Error('invalid check result');
      }
    } catch (error) {
      return dispatch({
        type: "INPUTCELL_UPDATECHECK_FAIL",
        error
      });
    }

    // update execution
    try {
      const updateSubmission = new QuerySubmission(
        inputCellState.origSparqlSubmission.endpointQuery, 
        inputCellState.origSparqlSubmission.endpointUpdate, 
        inputCellState.updateQuery,
        inputCellState.origSparqlSubmission.credentials);
      const updateResult = await executeSelectOrUpdateQuery(updateSubmission);
      if(updateResult === 'SUCCESS') {
        // // 1) signal successful update (drawback: no feedback if value actually changed)
        // dispatch({
        //   type: "INPUTCELL_UPDATE_SUCCESS",
        //   result: updateResult,
        // });
        // 2) redo query and reload complete table (drawback: no success indication)
        refreshTableCallback();
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
    // define the function that the reducer will use for generating the update query
    const buildUpdateQuery = () => {
      // deep copy orig rowBinding to keep it clean (e.g. in case of reset)
      const rowBindingWithNewValue = JSON.parse(JSON.stringify(rowBinding));
      // add the new value; valueNew prop is later used by the algo to indentify the modified variable
      rowBindingWithNewValue[variable].valueNew = String(newValue);
      // build the update query
      const updateQu = sparqlView.updateLogGraph?.length > 1 ? 
        buildUpdateLogQueryForVariable(sparqlSubmission.queryString, rowBindingWithNewValue, sparqlView) : 
        buildUpdateQueryForVariable(sparqlSubmission.queryString, rowBindingWithNewValue);
      return updateQu;
    }
    const buildCheckQuery = () => {
      // deep copy orig rowBinding to keep it clean (e.g. in case of reset)
      const rowBindingWithNewValue = JSON.parse(JSON.stringify(rowBinding));
      // add the new value; valueNew prop is later used by the algo to indentify the modified variable
      rowBindingWithNewValue[variable].valueNew = String(newValue);
      // build the update query
      const checkQu = buildCheckQueryForVariable(sparqlSubmission.queryString, rowBindingWithNewValue);
      return checkQu;
    }
    dispatch({
      type: "INPUTCELL_CHANGE",
      currentCellValue: newValue,
      buildUpdateQuery: buildUpdateQuery,
      buildCheckQuery: buildCheckQuery
    });
  };

  const handleInputReset = (e) => {
    if (typeof(insertModeReset) === 'function') { // insert mode reset
      insertModeReset();
    }
    inputRef.current.dataset.reset = true; // set flag for useEffect
    dispatch({
      type: "INPUTCELL_RESET"
    });
  };

  // focus input field
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    // if reset flag -> focus
    if (inputRef.current.dataset?.reset) {
      inputRef.current.dataset.reset = null;
      inputRef.current.focus();
    }
  }, [inputCellState]);

  // show buttons from start without value change
  React.useEffect( () => {
    if (insertMode) {
      const buildUpdateQuery = () => {
        rowBinding[variable].valueNew = String(inputCellState.origCellValue);
        const updateQu = buildUpdateQueryForVariable(sparqlSubmission.queryString, rowBinding, insertMode);
        return updateQu;
      }
      dispatch({ type: "INPUTCELL_INSERT_INIT", buildUpdateQuery: buildUpdateQuery });
      inputRef.current.dataset.reset = true; // set flag for focus
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isReadOnlyInput = inputCellState.isExecutingQuery || isRefreshing; // disable input when updating the value and refreshing the table
  const showButtons = (inputCellState.updateQuery || inputCellState.buildingError) ? true : false;
  const anyError = (inputCellState.buildingError || inputCellState.updateError || inputCellState.updateCheckError) ? true : false;
  const inputValue = (inputCellState.currentCellValue || inputCellState.currentCellValue === '') ? inputCellState.currentCellValue : inputCellState.origCellValue;

  return (
    <div>
      <Form onSubmit={e => handleLiteralUpdate(e)}>
        {
          {
            'checkbox': <Form.Check type="checkbox" onChange={e => handleCheckboxChange(e)} label={inputValue} ref={inputRef} checked={inputValue === 'true' ? true : false} isInvalid={anyError} readOnly={isReadOnlyInput} />,
            'textarea': <Form.Control as='textarea' onChange={e => handleInputChange(e)} ref={inputRef} value={inputValue} lang={language} isInvalid={anyError} isValid={inputCellState.updateResult ? true : null} readOnly={isReadOnlyInput} />
          }[inputType] ||
          <Form.Control type={inputType} onChange={e => handleInputChange(e)} isInvalid={anyError} ref={inputRef} value={inputValue} lang={language} step={inputStep} isValid={inputCellState.updateResult ? true : null} readOnly={isReadOnlyInput} />
        }
        <Collapse in={showButtons} mountOnEnter={true} unmountOnExit={true}>
          <div>
            <QueryResultTableInputCellButtons handleLiteralUpdate={handleLiteralUpdate} handleInputReset={handleInputReset} openModal={() => setModalShow(true)} inputCellState={inputCellState} />
          </div>
        </Collapse>
      </Form>
      { datatypeError && <div className="text-warning" title={datatypeError.message}><i className="bi bi-exclamation-triangle"></i><small> RDF datatype incorrect</small></div> }
      <QueryResultTableInputCellModal show={modalShow} onHide={() => setModalShow(false)} inputCellState={inputCellState} />
    </div>
  );
}
