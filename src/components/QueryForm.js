import React from "react";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { QuerySubmission } from "../scripts/QuerySubmission";
import useLocalStorage from "../hooks/useLocalStorage";

const initialQuery = 
`SELECT ?s ?p ?o 
WHERE {
  ?s ?p ?o .
}
LIMIT 20`;

export default function QueryForm({ isLoading, submitQueryCallback }) {
  const initialQuerySub = new QuerySubmission('','',initialQuery);
  const [querySub, setQuerySub] = useLocalStorage('queryFormData', initialQuerySub)

  function handleSubmit(e) {
    e.preventDefault();
    const submitQuerySub = {...querySub};
    // if no update endpoint => same as query endpoint
    if(submitQuerySub.endpointUpdate.length < 1) {
      submitQuerySub.endpointUpdate = submitQuerySub.endpointQuery;
    }
    submitQueryCallback(submitQuerySub);
  }

  function handleFormChange(querySubKey, newValue) {
    const newQuerySub = {...querySub};
    newQuerySub[querySubKey] = newValue;
    setQuerySub(newQuerySub);
  }

  return (
    <Form>
      <Row className="mb-1">
        <Form.Group as={Col} controlId="formSparqlEndpoint">
          <Form.Label>SPARQL query endpoint</Form.Label>
          <Form.Control type="url" value={querySub.endpointQuery} onChange={e => handleFormChange('endpointQuery', e.target.value)} required />
        </Form.Group>
        <Form.Group as={Col} controlId="formSparqlUpdateEndpoint">
          <Form.Label>(optional) update endpoint *</Form.Label>
          <Form.Control type="url" value={querySub.endpointUpdate} onChange={e => handleFormChange('endpointUpdate', e.target.value)} />
          <Form.Text className="text-muted">
            * necessary if different URLs for query and update are used.
          </Form.Text>
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="formSparqlQuery">
        <Form.Label>Query (with prefixes)</Form.Label>
        <Form.Control as="textarea" rows={6} value={querySub.queryString} onChange={e => handleFormChange('queryString', e.target.value)} required />
      </Form.Group>
 
      <Button variant="primary" type="submit" className='mb-4' disabled={isLoading} onClick={!isLoading ? e => handleSubmit(e) : null}>
        { isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> loading …</> : <><i className="bi bi-send"></i> submit query</>}
      </Button>
      
    </Form>
  );
}