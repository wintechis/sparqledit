import React from "react";
import Table from 'react-bootstrap/Table';
import { fromRdf } from "rdf-literal";

export default function QueryResultTable({ sparqlQuery, sparqlResultBindings }) {

  const tableHeadColumns = Object.keys(sparqlResultBindings[0])
    .filter(key => sparqlResultBindings[0][key].include === true)
    .map(key => <th key={key}>{key}</th>);
  const tableHead = <tr>{tableHeadColumns}</tr>;

  const generateTableBodyRowColumn = (variable,binding,rowIndex) => {
    const key = `${rowIndex}_${variable}`;
    if (binding.include === true) { 
      if(binding.termType === 'Literal') { // editable
        // edit event handler (use func exp for closure)
        const handleLiteralUpdate = (e) => {
          const editedRowBinding = sparqlResultBindings[rowIndex];
          editedRowBinding[variable].valueNew = String(e.target.value);
          console.log(editedRowBinding);
          //const updateQu = SPARQLedit.buildUpdateQueryForVariable(sparqlQuery, editedRowBinding);
        };
        return (
          <td key={key}>
            <input type={typeof(value) === 'number' ? 'number' : 'text'} defaultValue={fromRdf(binding)}
            onChange={e => handleLiteralUpdate(e)} />
          </td>
        );
      } else { // not editable
        return (
          <td key={key}>{binding.value}</td>
        );
      }      
    } else { // skip not selected vars
      return null;
    }
  };
  const generateTableBodyRow = (bindingsRow,rowIndex) => {
    return Object.entries(bindingsRow).map(([variable,binding]) => generateTableBodyRowColumn(variable,binding,rowIndex));
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
