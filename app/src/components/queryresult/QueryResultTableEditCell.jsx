import React from 'react';

import '../../styles/component-styles/QueryResultTableInputCell.css';

import Button from 'react-bootstrap/Button';

import QueryResultTableEditCellRestricted from './QueryResultTableEditCellRestricted'
import QueryResultTableEditCellInput from './QueryResultTableEditCellInput'

export default function QueryResultTableEditCell({ refreshTableCallback, isRefreshing, sparqlSubmission, rowBinding, variable, insertMode = false, sparqlView }) {
  const [showInput, setShowInput] = React.useState(false);
  
  const isRestrictedCell = sparqlView.restrictedVariable?.includes(variable);

  if (insertMode && isRestrictedCell) {
    return (<td></td>); // empty cell
  } else if (insertMode && !isRestrictedCell) {
    return (
      <td className="align-middle">
        { !showInput && 
          <Button variant="link" className="text-secondary" onClick={() => setShowInput(true)} disabled={isRefreshing}>
            <small>insert missing value</small>
          </Button>
        }
        { showInput &&
          <QueryResultTableEditCellInput  
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
  } else if (!insertMode && isRestrictedCell) {
    return (
      <td className="align-middle">
        <QueryResultTableEditCellRestricted rowBinding={rowBinding} variable={variable} />
      </td>
    );  
  } else {
    return (
      <td className="align-middle">
        <QueryResultTableEditCellInput 
          refreshTableCallback={refreshTableCallback} 
          isRefreshing={isRefreshing}
          sparqlSubmission={sparqlSubmission} 
          rowBinding={rowBinding} 
          variable={variable} 
          insertMode={false}
          sparqlView={sparqlView} />
      </td>
    );
  }
}