import React from 'react';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import QueryResultTableCell from './QueryResultTableCell';
import QueryResultTableInputCell from './QueryResultTableInputCell';
import prefixes from '@zazuko/rdf-vocabularies/prefixes';
import { shrink } from '@zazuko/rdf-vocabularies/shrink';

const ROWS_PER_PAGE = 10;

export default function QueryResultTable({ refreshTableCallback, sparqlResult }) {
  const [page, setPage] = React.useState(0);

  const sparqlResultBindings = sparqlResult.queryResult;
  const sparqlSubmission = sparqlResult.querySubmission;

  // calculate the selected page and rows
  const numberOfPages = Math.ceil(sparqlResultBindings.length / ROWS_PER_PAGE);
  const sparqlResultBindingsForPage = sparqlResultBindings.slice((page)*ROWS_PER_PAGE, (page+1)*ROWS_PER_PAGE);
  if (page > numberOfPages) {
    setPage(0); // reset pagination if new results have less pages
  }

  // add prefixes from query (overrides default prefixes)
  const queryObj = sparqlSubmission.getQueryObject();
  Object.entries(queryObj.prefixes).forEach(([pref, uri]) => prefixes[pref] = uri);

  // collect all columns to display in result table
  const columnNames = new Set(sparqlResultBindings.flatMap(binding => 
    Object.keys(binding).filter(key => binding[key].include === true)));
  const tableColumns = [...columnNames]; // transform to array
  // create table head
  const tableHead = <tr>{tableColumns.map(key => <th key={key}>{key}</th>)}</tr>;

  // create table body
  function generateTableBody(sparqlResultBindings, columnNames) {
    return sparqlResultBindings.map( 
      (bindingsRow,i) => <tr key={i}>{generateTableBodyRow(columnNames, bindingsRow, i)}</tr>
    );
  }
  function generateTableBodyRow(columnNames, rowBinding, rowIndex) {
    return columnNames.map(columnName => 
      rowBinding.hasOwnProperty(columnName) ? 
        generateTableBodyRowCell(columnName,rowBinding[columnName],rowIndex) : 
        <td key={`${rowIndex}_${columnName}`}></td>
    );
  };

  function generateTableBodyRowCell(variable, binding, rowIndex) {
    const key = `${rowIndex}_${variable}_${binding.value}`;
    if (binding.include === true) { 
      if(binding.termType === 'Literal') { // editable
        const keyForInputCell = `${key}_${Math.random()}`; // always rerender input fields
        const rowBinding = sparqlResultBindingsForPage[rowIndex];
        return <QueryResultTableInputCell key={keyForInputCell} refreshTableCallback={refreshTableCallback} sparqlSubmission={sparqlSubmission} rowBinding={rowBinding} variable={variable} />;
      } else { // not editable
        return <QueryResultTableCell key={key} rawUri={binding.value} prefixUri={shrink(binding.value)} />;
      }      
    } else { // skip not selected vars
      return null;
    }
  };
  const tableBody = generateTableBody(sparqlResultBindingsForPage, tableColumns);

  return (
    <section>
      <Table bordered hover size="sm" responsive>
        <thead>
          {tableHead}
        </thead>
        <tbody>
          {tableBody}
        </tbody>
      </Table>
      <PaginationControl numberOfPages={numberOfPages} page={page} setPage={setPage} />
    </section>
  );
}

function PaginationControl({ numberOfPages, page, setPage }) {
  if(numberOfPages <= 1) return null;

  const MAX_PAGES = 10;
  const PAGES_CONTROL_RANGE = 3;

  function createPaginationItems(numberOfPages) {
    // only show some pages in controls if more than 10 pages
    const showPageControls = (i) => 
      (i===0 || Math.abs(i-page)<=PAGES_CONTROL_RANGE || (i+1)===numberOfPages || numberOfPages<MAX_PAGES);

    return [...Array(numberOfPages).keys()] // 0,1,2,..,numberOfPages
      .filter( i => showPageControls(i) )
      .map( i => <Pagination.Item key={i} onClick={ ()=>setPage(i) } active={ i===page ? true : false}>{i+1}</Pagination.Item> );
  }

  return (
    <Pagination className="justify-content-end">
      { createPaginationItems(numberOfPages) }
    </Pagination>
  );
}