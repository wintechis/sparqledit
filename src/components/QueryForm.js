import React from "react";
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { QuerySubmission } from "../scripts/QuerySubmission";
import useLocalStorage from "../hooks/useLocalStorage";

import Yasqe from "@triply/yasqe";
import "@triply/yasqe/build/yasqe.min.css";

const initialQuery = 
`SELECT ?s ?p ?o 
WHERE {
  ?s ?p ?o .
}
LIMIT 20`;

export default function QueryForm({ isLoading, submitQueryCallback }) {
  const initialQuerySub = new QuerySubmission('','',initialQuery);
  const [querySub, setQuerySub] = useLocalStorage('queryFormData', initialQuerySub);
  const [yasqe, setYasqe] = React.useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    handleYasqeSubmit();
  }
  function handleYasqeSubmit() {
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

  React.useEffect(() => {
    //const handlerSubmit = (yasqe, reqest) => handleYasqeSubmit(yasqe, reqest);
    const handlerSubmit = () => handleYasqeSubmit();
    const handlerChange = (yasqe) => handleFormChange('queryString', yasqe.getValue());

    if (!yasqe) {
      // create instance of YASQE
      const newYasqe = new Yasqe(document.getElementById("yasqe"));
      // set initial query and endpoint
      newYasqe.setValue(querySub.queryString);
      //newYasqe.options.requestConfig.endpoint = querySub.endpointQuery;
      setYasqe(newYasqe);
    } else {
      // register event handler
      yasqe.on("query", handlerSubmit);
      yasqe.on("change", handlerChange);
    }

    // cleanup
    return () => {
      if (yasqe) {
        yasqe.off("query", handlerSubmit);
        yasqe.off("change", handlerChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yasqe, querySub]);

  return (
    <Form className='mb-4'>
      <Row className="mb-2">
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
      <div id='yasqe' />
      <Button variant="primary" type="submit" className='mt-1' disabled={isLoading} onClick={!isLoading ? e => handleSubmit(e) : null}>
        { isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> loading … </> : <><i className="bi bi-send"></i> submit query </>}
      </Button>
    </Form>
  );
}