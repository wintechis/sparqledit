import React from 'react';

import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import QueryForm from './QueryForm';
import QueryResult from './QueryResult';
import ErrorBox from './ErrorBox';

import useFetchSparql from '../hooks/useFetchSparql';
import { QuerySubmission } from '../scripts/models/QuerySubmission';

export default function SparqlViewDetail({ sparqlView, sparqlViewUpdateCallback, isEditMode = true }) {
  // query execution
  const [submittedQuery, setSubmittedQuery] = React.useState();

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
      sparqlView.query));
  };

  return (
    <section>
      { isEditMode ? 
        <QueryForm sparqlView={sparqlView} sparqlViewUpdateCallback={sparqlViewUpdateCallback} isLoading={isLoading} onlyShowSubmitButton={!isEditMode} submitQueryCallback={executeQuery} /> :
        <div className='mb-4'>
          <Button variant="primary" onClick={executeQuery} form="queryForm" disabled={isLoading} className="px-2">
          { isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="mx-2" /> loading … </> : <><i className="bi bi-send"></i> load data table </>}
          </Button>
        </div>
      }
      {error ? <ErrorBox error={error} /> : null}
      {sparqlResult ? <QueryResult refreshTableCallback={executeQuery} sparqlResult={sparqlResult} /> : null}
    </section>
  );
}