import React from 'react';
import Button from 'react-bootstrap/Button';
import { fromRdf } from 'rdf-literal';
import { buildUpdateQueryForVariable, executeUpdateQuery } from '../scripts/sparqledit';

export default function QueryResultTableInputCell({ refreshTableCallback, sparqlSubmission, rowBinding, variable }) {
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
    setCurrentValue(origValue);
    setUpdateQuery(null);
  };
  
  return (
    <td>
      <input type={inputType} value={currentValue} onChange={e => handleInputChange(e)} />
      { updateQuery ? <>
        <Button variant="primary" type="submit" onClick={e => handleLiteralUpdate(e)}>update</Button>
        <Button variant="secondary" onClick={e => handleInputReset()}>reset</Button>
        </> : null }
      { updateResult ? <span>{updateResult}</span> : null }
    </td>
  );
}
