
import React from 'react';
import QueryResultTable from './queryresulttable/QueryResultTable';

export default function QueryResult(props) {
  const displayTable = (
    props.sparqlResult && 
    props.sparqlResult.queryResult && 
    props.sparqlResult.queryResult.length >= 1
  );

  return (
    <>
    { displayTable ? <QueryResultTable {...props} /> : <section><p>No results to display</p></section> }
    </>
  );
}
