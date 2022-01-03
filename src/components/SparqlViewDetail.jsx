import React from 'react';

import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import QueryForm from './QueryForm';
import QueryResult from './QueryResult';
import ErrorBox from './ErrorBox';

import useFetchSparql from '../hooks/useFetchSparql';
import { QuerySubmission } from '../scripts/models/QuerySubmission';

export default function SparqlViewDetail({ sparqlView, isEditMode = true }) {
  const initialQuery = new QuerySubmission(
    sparqlView.queryURL,
    sparqlView.updateURL,
    sparqlView.query
  );
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
    <section>
      { isEditMode ? 
        <QueryForm querySubmission={initialQuery} isLoading={isLoading} onlyShowSubmitButton={!isEditMode} submitQueryCallback={executeQuery} /> :
        <div className='mb-4'>
          <Button variant="primary" onClick={() => executeQuery(initialQuery)} form="queryForm" disabled={isLoading} className="px-2">
          { isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="mx-2" /> loading … </> : <><i className="bi bi-send"></i> load data table </>}
          </Button>
        </div>
      }
      {error ? <ErrorBox error={error} /> : null}
      {sparqlResult ? <QueryResult refreshTableCallback={executeQuery} sparqlResult={sparqlResult} /> : null}
    </section>
  );
}