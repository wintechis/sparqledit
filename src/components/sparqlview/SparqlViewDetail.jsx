import React from 'react';

import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import SparqlViewDetailForm from './SparqlViewDetailForm';
import QueryResult from '../queryresult/QueryResult';
import ErrorBox from '../common/ErrorBox';

import useFetchSparql from '../../hooks/useFetchSparql';
import { QuerySubmission } from '../../scripts/models/QuerySubmission';

export default function SparqlViewDetail({ sparqlView, sparqlViewUpdateCallback, isEditMode = true }) {
  // query execution
  const [submittedQuery, setSubmittedQuery] = React.useState();
  const [credentials, setCredentials] = React.useState({ username: '', password: ''});

  const { 
    loading: isLoading, 
    result: sparqlResult,
    error
  } = useFetchSparql(submittedQuery);

  const executeQuery = () => {
    // if no explicit update endpoint => same as query endpoint
    const updateURL = sparqlView.updateURL && sparqlView.updateURL.length > 1 ? sparqlView.updateURL : sparqlView.queryURL;
    setSubmittedQuery(new QuerySubmission(
      sparqlView.queryURL,
      updateURL,
      sparqlView.query,
      credentials));
  };

  function handleCredentialsInput(key, newValue) {
    const newCredentials = {...credentials};
    newCredentials[key] = newValue;
    setCredentials(newCredentials);
  }
  const credFormJsx = <SparqlViewDetailFormCredentials credentials={credentials} handleCredentialsInput={handleCredentialsInput} />;

  return (
    <section>
      { isEditMode ? 
        <SparqlViewDetailForm 
          sparqlView={sparqlView} 
          sparqlViewUpdateCallback={sparqlViewUpdateCallback} 
          isLoading={isLoading} 
          onlyShowSubmitButton={!isEditMode} 
          submitQueryCallback={executeQuery}
          credentialsForm={credFormJsx} /> :
        <Form onSubmit={e => {e.preventDefault(); executeQuery()}}>
          { sparqlView.requiresBasicAuth ? 
            <dl className="row">
              <dt className="col-sm-2">Authentication</dt>
              <dd className="col-sm-5">{credFormJsx}</dd>
            </dl> : null }
          <div className='mb-4'>
            <Button variant="primary" type="submit" disabled={isLoading} className="px-2">
            { isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="mx-2" /> loading … </> : <><i className="bi bi-send"></i> load data table </>}
            </Button>
          </div>
        </Form>
      }
      {error ? <ErrorBox error={error} /> : null}
      {sparqlResult ? <QueryResult refreshTableCallback={executeQuery} sparqlResult={sparqlResult} /> : null}
    </section>
  );
}

function SparqlViewDetailFormCredentials({ credentials, handleCredentialsInput }) {
  return (
    <Row>
      <Col>
        <FloatingLabel controlId="formCredentialsUsername" label="Username *">
          <Form.Control type="text" placeholder="username" autoComplete="username" value={credentials.username} onChange={e => handleCredentialsInput( 'username', e.target.value )} required />
        </FloatingLabel>
      </Col>
      <Col>
        <FloatingLabel controlId="formCredentialsPassword" label="Password *">
          <Form.Control type="password" placeholder="password" autoComplete="current-password" value={credentials.password} onChange={e => handleCredentialsInput( 'password', e.target.value )} required />
        </FloatingLabel>
      </Col>
    </Row>
  );
}