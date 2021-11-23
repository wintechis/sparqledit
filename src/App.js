import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/App.css';

import Container from 'react-bootstrap/Container';
import QueryForm from './components/QueryForm';
import QueryResultTable from './components/QueryResultTable';

import { executeSelectQuery } from './scripts/sparqledit';

function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [submittedQuery, setSubmittedQuery] = React.useState();
  const [resultBindings, setResultBindings] = React.useState();
  
  async function executeQuery(querySubmission) {
    setIsLoading(true);
    setSubmittedQuery(querySubmission);
    const results = await executeSelectQuery(
      querySubmission.endpointQuery, querySubmission.queryString);
    console.log(results);
    setResultBindings(results);
    setIsLoading(false);
  };

  function refreshTable(querySubmission) {
    executeQuery(querySubmission);
  };

  return (
    <Container className="App">
      <h1 className="mb-4">SPARQL_edit</h1>
      <QueryForm isLoading={isLoading} submitQueryCallback={executeQuery} />
      { resultBindings ? <QueryResultTable refreshTableCallback={refreshTable} sparqlSubmission={submittedQuery} sparqlResultBindings={resultBindings} /> : null }
    </Container>
  );
}

export default App;
