
import React from 'react';

import QueryResultTable from './QueryResultTable';

export default function QueryResult(props) {
  const displayTable = (
    props.sparqlResult && 
    props.sparqlResult.queryResult && 
    props.sparqlResult.queryResult.length >= 1
  );

  return (
    <section>
    { displayTable ? <QueryResultTable {...props} /> : <p>No results to display</p> }
    </section>
  );
}
