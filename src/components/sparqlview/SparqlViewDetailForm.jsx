import React from 'react';

import '../../styles/component-styles/SparqlViewDetailForm.css';

import Yasqe from '@triply/yasqe';
import '@triply/yasqe/build/yasqe.min.css';

import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

export default function SparqlViewDetailForm({ sparqlView, sparqlViewUpdateCallback, isLoading, submitQueryCallback, credentialsForm }) {
  const [yasqe, setYasqe] = React.useState(null);
  
  function handleSubmit(e) {
    e.preventDefault();
    handleYasqeSubmit();
  }
  function handleYasqeSubmit() {
    submitQueryCallback();
  }

  function handleFormChange(sparqlViewKey, newValue) {
    sparqlView[sparqlViewKey] = newValue;
    sparqlView['dateCreated'] = Date.now();
    sparqlViewUpdateCallback(sparqlView);
  }

  // init and update YASQE
  React.useEffect(() => {
    //const handlerSubmit = (yasqe, reqest) => handleYasqeSubmit(yasqe, reqest);
    const handlerSubmit = () => handleYasqeSubmit();
    const handlerChange = (yasqe) => handleFormChange('query', yasqe.getValue());

    if (!yasqe) {
      // create instance of YASQE
      const yasqeSettings = {
        lineNumbers: true,
        persistent: null,
        showQueryButton: true,
        tabSize: 2,
        extraKeys: {
          "Ctrl-Enter": handlerSubmit,
          "Ctrl-S": null
        }
      }
      const newYasqe = new Yasqe(document.getElementById("yasqe"), yasqeSettings);
      //newYasqe.query = () => Promise.reject("No querying via yasqe.");
      newYasqe.query = async () => handlerSubmit();
      // set initial query and endpoint
      newYasqe.setValue(sparqlView.query);
      newYasqe.options.requestConfig.endpoint = sparqlView.queryURL;
      setYasqe(newYasqe);
    } else {
      // update yasqe query function with new functions from new closure
      yasqe.query = async () => handlerSubmit();
      // override share url
      yasqe.config.createShareableLink = () => window.location.href;
      // override shortcut submit with own handler
      yasqe.options.extraKeys["Ctrl-Enter"] = handlerSubmit;
      // update query endpoint
      yasqe.options.requestConfig.endpoint = sparqlView.queryURL;
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
  }, [yasqe, sparqlView]);

  return (
    <section className='mb-4'>
      <Form className='mb-1' id="queryForm" onSubmit={!isLoading ? e => handleSubmit(e) : null}>
        <Row className="mb-2 mt-3">
          <Col lg={3}>
            <h5 className="mb-4">General information</h5>
          </Col>
          <Col>
            <Form.Group as={Row} className="mb-3" controlId="formName">
              <Form.Label column sm={3}>Name *</Form.Label>
              <Col sm={9}>
                <Form.Control type="text" value={sparqlView.name} onChange={e => handleFormChange('name', e.target.value)} required />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formCreator">
              <Form.Label column sm={3}>Creator</Form.Label>
              <Col sm={9}>
                <Form.Control type="text" value={sparqlView.creator} onChange={e => handleFormChange('creator', e.target.value)} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formDescription">
              <Form.Label column sm={3}>Description</Form.Label>
              <Col sm={9}>
                <Form.Control as="textarea" rows={3} value={sparqlView.description} onChange={e => handleFormChange('description', e.target.value)} />
              </Col>
            </Form.Group>
          </Col>
          <Col lg="2">
            <p className="text-secondary">* required fields</p>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col lg={3}>
            <h5 className="mb-4">SPARQL endpoint</h5>
          </Col>
          <Col>
            <Form.Group as={Row} className="mb-3" controlId="formQueryUrl">
              <Form.Label column sm={3}>Query URL *</Form.Label>
              <Col sm={9}>
                <Form.Control type="text" value={sparqlView.queryURL} onChange={e => handleFormChange('queryURL', e.target.value)} required />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formUpdateUrl">
              <Form.Label column sm={3}>Update URL</Form.Label>
              <Col sm={9}>
                <Form.Control type="text" value={sparqlView.updateURL} onChange={e => handleFormChange('updateURL', e.target.value)} />
                <Form.Text className="text-muted px-1">
                  necessary if different URLs for query and update are used
                </Form.Text>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formBasicAuth">
              <Form.Label column sm={3}>Basic Auth</Form.Label>
              <Col sm={9}>
                <Form.Check type="switch" className="form-switch-md" size="lg" id="formBasicAuthSwitch" checked={sparqlView.requiresBasicAuth} onChange={e => handleFormChange('requiresBasicAuth', e.target.checked)} />
                { sparqlView.requiresBasicAuth ? credentialsForm : null }
              </Col>
            </Form.Group>
          </Col>
          <Col lg="2"></Col>
        </Row>
        </Form>
        <Row className="mb-2">
          <Col lg={3}>
            <h5 className="mb-4">SPARQL query</h5>
          </Col>
          <Col>
            <div id='yasqe' />
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" form="queryForm" disabled={isLoading} className="my-2">
                { isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> loading … </> : <><i className="bi bi-send"></i> submit query </>}
              </Button>
            </div>
          </Col>
        </Row>    
    </section>
  );
}