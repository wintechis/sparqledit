import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

import Container from 'react-bootstrap/Container';
import QueryForm from './components/QueryForm';
import QueryResultTable from './components/QueryResultTable';

import {executeSelectQuery} from './scripts/sparqledit'

function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [submittedQuery, setSubmittedQuery] = React.useState();
  const [resultBindings, setResultBindings] = React.useState();
  
  async function executeQuery(querySubmission) {
    setIsLoading(true);
    setSubmittedQuery(querySubmission.queryString);
    const results = await executeSelectQuery(
      querySubmission.endpointQuery, querySubmission.queryString);
    console.log(results);
    setResultBindings(results);
    setIsLoading(false);
  }

  return (
    <Container className="App">
      <h1>SPARQL_edit</h1>
      <QueryForm isLoading={isLoading} submitQueryCallback={executeQuery} />
      { resultBindings ? <QueryResultTable sparqlQuery={submittedQuery} sparqlResultBindings={resultBindings} /> : null }
    </Container>
  );
}

export default App;
