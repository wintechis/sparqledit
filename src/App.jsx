import React from 'react';

//import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/bootstrap-custom.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import QueryForm from './components/QueryForm';
import QueryResult from './components/QueryResult';
import ErrorBox from './components/ErrorBox';

import useFetchSparql from './hooks/useFetchSparql';
import { QuerySubmission } from './scripts/models/QuerySubmission';

function App() {
  const [submittedQuery, setSubmittedQuery] = React.useState();

  const { 
    loading: isLoading, 
    result: sparqlResult,
    error
  } = useFetchSparql(submittedQuery);

  const executeQuery = (querySubmission) => {
    setSubmittedQuery(new QuerySubmission(
      querySubmission.endpointQuery,
      querySubmission.endpointUpdate,
      querySubmission.queryString));
  };

  return (
    <>
      <Navbar bg="light" variant="light" className="mb-4">
        <Container>
          <Navbar.Brand>
            <img alt="" src="logo_cs.png" height="40" className="d-inline-block" />
            <h2 className="d-inline-block align-middle mx-2">SPARQL_edit</h2>
          </Navbar.Brand>
          <Nav className="justify-content-end">
            <Nav.Item>
              <Nav.Link className="justify-content-end" href="mailto:sascha.meckler@iis.fraunhofer.de">Contact</Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>
      </Navbar>
      <Container className="App">
        <QueryForm isLoading={isLoading} submitQueryCallback={executeQuery} />
        {error ? <ErrorBox error={error} /> : null}
        {sparqlResult ? <QueryResult refreshTableCallback={executeQuery} sparqlResult={sparqlResult} /> : null}
      </Container>
    </>
  );
}

export default App;
