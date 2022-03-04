import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';

import QueryResultTableCell from './QueryResultTableCell';
import QueryResultTableInputCell from './QueryResultTableInputCell';

import prefixes from '@zazuko/rdf-vocabularies/prefixes';
import { shrink } from '@zazuko/rdf-vocabularies/shrink';

import { downloadCSV } from '../../scripts/utilities';
import { 
  addInsertModeLiteralsToQueryResultBindings, 
  getTableColumnsFromResultBindings,
  createCSVStringFromResultBindings
} from '../../scripts/component-scripts/resultTableHelper';

const ROWS_PER_PAGE = 10;

export default function QueryResultTable({ refreshTableCallback, sparqlResult }) {
  const [page, setPage] = React.useState(0);
  const [searchString, setSearchString] = React.useState("");
  const [sortColumnName, setSortColumnName] = React.useState("");

  const sparqlResultBindingsRaw = sparqlResult.queryResult;
  const sparqlSubmission = sparqlResult.querySubmission;

  // prepare insert feature
  if (sparqlSubmission.queryString.toLowerCase().includes('optional')) { 
    // skip if query w/o OPTIONAL; no problem if executed anyway
    addInsertModeLiteralsToQueryResultBindings(sparqlResultBindingsRaw);
  }

  // filter (text search)
  const sparqlResultBindings = sparqlResultBindingsRaw.filter(binding => Object.values(binding).some(spo => spo.value.toLowerCase().indexOf(searchString.toLowerCase()) > -1));

  // sorting
  function sortColumnNameHandler(key) {
    setSortColumnName(sortColumnName === key ? "" : key);
  }
  function compare(b1, b2) {
    if (b1[sortColumnName] && b2[sortColumnName]) {
      if (b1[sortColumnName].value.toLowerCase() === b2[sortColumnName].value.toLowerCase()) {
        return 0; // equal values
      } else { // compare
        return b1[sortColumnName].value.toLowerCase() < b2[sortColumnName].value.toLowerCase() ? -1 : 1;
      }
    } else { // b1 and/or b2 are undefined
      if (b1[sortColumnName]) {
        return -1; // sort values before null
      } else if (b2[sortColumnName]) {
        return 1;
      } else { // both undefined
        return 0;
      }
    }
  };
  if (sortColumnName && sortColumnName.length > 0) {
    sparqlResultBindings.sort(compare);
  }

  // calculate the selected page and rows
  const numberOfPages = Math.ceil(sparqlResultBindings.length / ROWS_PER_PAGE);
  const sparqlResultBindingsForPage = sparqlResultBindings.slice((page)*ROWS_PER_PAGE, (page+1)*ROWS_PER_PAGE);
  if (page > numberOfPages) {
    setPage(0); // reset pagination if new results have less pages
  }

  // number of displayed, filtered and total results
  const resultNumbers = {
    displayed: sparqlResultBindingsForPage.length,
    filtered: sparqlResultBindings.length,
    total: sparqlResultBindingsRaw.length
  }

  // add prefixes from query (overrides default prefixes)
  Object.entries(sparqlResult.queryObject.prefixes)
    .forEach(([pref, uri]) => prefixes[pref] = uri);

  // create table head
  const tableColumns = getTableColumnsFromResultBindings(sparqlResultBindings);
  const tableHead = <tr>{tableColumns.map(key => 
    <th key={key}>
      <div className="d-flex justify-content-between">
        <h5 className="text-break my-auto mx-1">{key}</h5>
        <Button variant="link" className={ key === sortColumnName ? 'text-primary' : 'text-secondary'} onClick={() => sortColumnNameHandler(key)}><i className="bi bi-sort-alpha-down"></i></Button>
      </div>
    </th>)}</tr>;

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
        return (
          <QueryResultTableInputCell 
            key={keyForInputCell} 
            refreshTableCallback={refreshTableCallback} 
            sparqlSubmission={sparqlSubmission} 
            rowBinding={rowBinding} 
            variable={variable} 
            insertMode={!!binding.insertMode} />
        );
      } else { // not editable
        return <QueryResultTableCell key={key} rawUri={binding.value} prefixUri={shrink(binding.value)} />;
      }      
    } else { // skip not selected vars
      return null;
    }
  };
  const tableBody = generateTableBody(sparqlResultBindingsForPage, tableColumns);

  // CSV download
  function downloadFilteredSortedTableAsCSV() {
    // create CSV
    const csvStr = createCSVStringFromResultBindings(sparqlResultBindings);
    // download
    downloadCSV(csvStr, 'sparqledit.csv');
  }

  return (
    <>
      <TableUtilities resultNumbers={resultNumbers} searchString={searchString} searchChangeCallback={e => setSearchString( e.target.value )} />
      <Table hover size="sm" responsive>
        <thead>
          {tableHead}
        </thead>
        <tbody>
          {tableBody}
        </tbody>
      </Table>
      <Row>
        <Col>
          <Button variant="link" className="link-secondary" onClick={() => downloadFilteredSortedTableAsCSV()}>Save table as CSV</Button>
        </Col>
        <Col xs="auto">
          <PaginationControl numberOfPages={numberOfPages} page={page} setPage={setPage} />
        </Col>
      </Row>
    </>
  );
}

function TableUtilities({ resultNumbers, searchString, searchChangeCallback }) {
  return (
    <Row>
      <Col>
        {searchString ?
          <p className="align-middle">Displaying <strong>{resultNumbers.displayed}</strong><strong> / {resultNumbers.filtered}</strong> filtered results ( <strong>{resultNumbers.total}</strong> total results )</p> :
          <p className="align-middle">Displaying <strong>{resultNumbers.displayed}</strong><strong> / {resultNumbers.total}</strong> total results</p>
        }
      </Col>
      <Col xs="auto">
        <InputGroup className="mb-3">
          <FormControl placeholder="search ..." aria-label="full-text search" aria-describedby="search-field"
            value={searchString} onChange={searchChangeCallback} />
          <InputGroup.Text id="search-field"><i className="bi bi-search"></i></InputGroup.Text>
        </InputGroup>
      </Col>
    </Row>
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
