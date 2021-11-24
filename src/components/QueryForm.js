import React from "react";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import QuerySubmission from "../scripts/QuerySubmission";

const initialUrl = 'http://localhost:3030/obuger_test/';
const initialQuery = 
`SELECT ?s ?p ?o 
WHERE {
  ?s ?p ?o .
}
LIMIT 20`;

export default function QueryForm({ isLoading, submitQueryCallback }) {

  // TODO: use localstorage hook
  const [endpointQuery, setEndpointQuery] = React.useState(initialUrl);
  const [endpointUpdate, setEndpointUpdate] = React.useState("");
  const [query, setQuery] = React.useState(initialQuery);

  function handleSubmit(e) {
    e.preventDefault();
    // build query obj
    const updateUrl = (endpointUpdate.length >= 1) ? endpointUpdate : endpointQuery;
    const querySub = new QuerySubmission(endpointQuery, updateUrl, query);
    submitQueryCallback(querySub);
  }

  return (
    <Form>
      <Row className="mb-1">
        <Form.Group as={Col} controlId="formSparqlEndpoint">
          <Form.Label>SPARQL query endpoint</Form.Label>
          <Form.Control type="url" value={endpointQuery} onChange={e => setEndpointQuery(e.target.value)} required />
        </Form.Group>
        <Form.Group as={Col} controlId="formSparqlUpdateEndpoint">
          <Form.Label>(optional) update endpoint *</Form.Label>
          <Form.Control type="url" value={endpointUpdate} onChange={e => setEndpointUpdate(e.target.value)} />
          <Form.Text className="text-muted">
            * necessary if different URLs for query and update are used.
          </Form.Text>
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="formSparqlQuery">
        <Form.Label>Query (with prefixes)</Form.Label>
        <Form.Control as="textarea" rows={6} value={query} onChange={e => setQuery(e.target.value)} required />
      </Form.Group>
 
      <Button variant="primary" type="submit" className='mb-4' disabled={isLoading} onClick={!isLoading ? e=>handleSubmit(e) : null}>
        { isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> loading …</> : <><i className="bi bi-send"></i> submit query</>}
      </Button>
      
    </Form>
  );
}