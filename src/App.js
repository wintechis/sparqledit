import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/App.css';

import Container from 'react-bootstrap/Container';
import QueryForm from './components/QueryForm';
import QueryResult from './components/QueryResult';
import ErrorBox from './components/ErrorBox';

import useFetchSparql from './hooks/useFetchSparql';

function App() {
  const [submittedQuery, setSubmittedQuery] = React.useState();

  const { 
    loading: isLoading, 
    result: sparqlResult,
    error
  } = useFetchSparql(submittedQuery);

  const executeQuery = (querySubmission) => {
    setSubmittedQuery(querySubmission);
  };

  return (
    <Container className="App">
      <h1 className="mb-4">SPARQL_edit</h1>
      <QueryForm isLoading={isLoading} submitQueryCallback={executeQuery} />
      { error ? <ErrorBox error={error} /> : null }
      { sparqlResult ? <QueryResult refreshTableCallback={executeQuery} sparqlResult={sparqlResult} /> : null }
    </Container>
  );
}

export default App;
