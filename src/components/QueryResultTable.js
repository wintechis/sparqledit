import React from 'react';
import Table from 'react-bootstrap/Table';
import QueryResultTableInputCell from './QueryResultTableInputCell';
import { prefixes, shrink } from '@zazuko/rdf-vocabularies';

export default function QueryResultTable({ refreshTableCallback, sparqlSubmission, sparqlResultBindings }) {

  // add prefixes from query (overrides default prefixes)
  const queryObj = sparqlSubmission.getQueryObject();
  Object.entries(queryObj.prefixes).forEach( ([pref,uri]) => prefixes[pref] = uri);

  const tableHeadColumns = Object.keys(sparqlResultBindings[0])
    .filter(key => sparqlResultBindings[0][key].include === true)
    .map(key => <th key={key}>{key}</th>);
  const tableHead = <tr>{tableHeadColumns}</tr>;

  const generateTableBodyRowCell = (variable,binding,rowIndex) => {
    const key = `${rowIndex}_${variable}_${binding.value}`;
    if (binding.include === true) { 
      if(binding.termType === 'Literal') { // editable
        const keyForInputCell = `${key}_${Math.random()}`; // always rerender input fields
        const rowBinding = sparqlResultBindings[rowIndex];
        return <QueryResultTableInputCell key={keyForInputCell} refreshTableCallback={refreshTableCallback} sparqlSubmission={sparqlSubmission} rowBinding={rowBinding} variable={variable} />;
      } else { // not editable
        // shrink with prefix
        const displayValue = shrink(binding.value) || binding.value;
        return <td key={key}>{displayValue}</td>;
      }      
    } else { // skip not selected vars
      return null;
    }
  };
  const generateTableBodyRow = (rowBinding,rowIndex) => {
    return Object.entries(rowBinding).map(([variable,binding]) => generateTableBodyRowCell(variable,binding,rowIndex));
  };
  const tableBody = sparqlResultBindings.map( (bindingsRow,i) => <tr key={i}>{generateTableBodyRow(bindingsRow,i)}</tr>);

  return (
    <Table bordered hover size="sm">
      <thead>
        {tableHead}
      </thead>
      <tbody>
        {tableBody}
      </tbody>
    </Table>    
  );
}
