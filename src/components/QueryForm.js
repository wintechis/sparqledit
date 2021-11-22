import React from "react";
import Form from 'react-bootstrap/Form';
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
  const [query, setQuery] = React.useState(initialQuery);

  function handleSubmit(e) {
    e.preventDefault();
    // build query obj
    const querySub = new QuerySubmission(endpointQuery, endpointQuery, query)
    submitQueryCallback(querySub);
  }

  return (
    // TODO: floating labels
    <Form>
      <Form.Group className="mb-3" controlId="formSparqlEndpoint">
        <Form.Label>SPARQL endpoint</Form.Label>
        <Form.Control type="url" value={endpointQuery} onChange={e => setEndpointQuery(e.target.value)} required />
        <Form.Text className="text-muted">
          URL for queries and update queries.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formSparqlQuery">
        <Form.Label>Query (with prefixes)</Form.Label>
        <Form.Control as="textarea" rows={6} value={query} onChange={e => setQuery(e.target.value)} required />
      </Form.Group>

      <Button variant="primary" type="submit" disabled={isLoading} onClick={!isLoading ? e=>handleSubmit(e) : null}>
        { isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> loading …</> : 'Submit query'}
      </Button>
    </Form>
  );
}