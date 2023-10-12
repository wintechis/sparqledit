import React from 'react';

import '../../styles/component-styles/SparqlViewDetailForm.css';

// // use official yasgui components
// // npm i @triply/yasqe
// import Yasqe from '@triply/yasqe';
// import '@triply/yasqe/build/yasqe.min.css';

// use fork from github:smeckler/yasgui-spedit with restricted SPARQL grammar
import Yasqe from 'yasgui' // to have TS types; (alt: import Yasqe from 'yasgui/build/yasqe.min.js')
import 'yasgui/build/yasqe.min.css';

import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

export default function SparqlViewDetailForm({ sparqlView, sparqlViewUpdateCallback, isLoading, submitQueryCallback, credentialsForm }) {
  const [yasqe, setYasqe] = React.useState(null);
  const [isInvalidQuery, setIsInvalidQuery] = React.useState(false);
  const yasqeQueryVariables = yasqe?.getVariablesFromQuery().map(varStr => varStr.substring(1));

  function handleSubmit(e) {
    e.preventDefault();
    submitQueryCallback();
  }

  function handleFormChange(sparqlViewKey, newValue) {
    sparqlView[sparqlViewKey] = newValue;
    sparqlView['dateCreated'] = Date.now();
    sparqlViewUpdateCallback(sparqlView);
  }

  function handleInvalidQuery() {
    if(!yasqe) return;
    if (yasqe.queryValid === false) {
      setIsInvalidQuery(true);
      yasqe.showNotification('invalidQueryNotification', 
      'invalid syntax or grammar (SPARQL_edit allows only a subset of SPARQL)');
    } else {
      setIsInvalidQuery(false);
      yasqe.hideNotification('invalidQueryNotification');
    }
  }

  // init and update YASQE
  React.useEffect(() => {
    const handlerChange = (yasqe) => {
      handleFormChange('query', yasqe.getValue());
    }

    if (!yasqe) {
      // create instance of YASQE
      const yasqeSettings = {
        lineNumbers: true,
        tabSize: 2,
        extraKeys: { "Ctrl-S": null } // disable save shortcut
      }
      const newYasqe = new Yasqe(document.getElementById("yasqe"), yasqeSettings);
      // set initial query
      newYasqe.setValue(sparqlView.query);
      setYasqe(newYasqe);
    } else {
      // if yasqe already exists, register event handler
      yasqe.on("change", handlerChange);
    }
    handleInvalidQuery(); // validate initial query

    // cleanup
    return () => {
      if (yasqe) {
        yasqe.off("change", handlerChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yasqe, sparqlView, submitQueryCallback]);

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
            <Form.Group as={Row} className="mb-3" controlId="formUpdateLogGraph">
              <Form.Label column sm={3}>Update logging</Form.Label>
              <Col sm={9}>
                <UpdateLogGraphForm sparqlView={sparqlView} handleGraphNameChange={graphName => handleFormChange('updateLogGraph', graphName)} />
              </Col>
            </Form.Group>
            { yasqeQueryVariables?.length > 0 && 
              <Form.Group as={Row} className="mb-3" controlId="formRestrictedVariables">
                <Form.Label column sm={3}>Restricted variables</Form.Label>
                <Col sm={9}>
                  <RestrictedVariablesForm sparqlView={sparqlView} handleRestrictedVariablesChange={restrVars => handleFormChange('restrictedVariable', restrVars)} variablesFromQuery={yasqeQueryVariables} />
                </Col>
              </Form.Group>
            }
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
              <Button variant={isInvalidQuery ? 'secondary' : 'primary'} type="submit" form="queryForm" disabled={isLoading} className="my-2">
                { isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> loading … </> : <><i className="bi bi-send"></i> {isInvalidQuery ? 'submit invalid query' : 'submit query'}</>}
              </Button>
            </div>
          </Col>
        </Row>    
    </section>
  );
}

function UpdateLogGraphForm({ sparqlView, handleGraphNameChange }) {
  const [isUpdateLog, setIsUpdateLog] = React.useState(typeof sparqlView.updateLogGraph === 'string' || false);

  function handleSwitchChange(newCheckState) {
    if (newCheckState === true) {
      setIsUpdateLog(true);
      handleGraphNameChange('');
    } else {
      setIsUpdateLog(false);
      handleGraphNameChange(undefined);
    }
  }

  return (
    <>
      <Form.Check type="switch" className="form-switch-md" size="lg" id="formUpdateLogGraphSwitch" checked={isUpdateLog} onChange={e => handleSwitchChange(e.target.checked)} />
      { isUpdateLog &&   
        <FloatingLabel controlId="formUpdateLogGraphName" label="Named Graph for update logs *">
          <Form.Control type="text" placeholder="http://example.org/graph/updatelogs" autoComplete="graph-name" value={sparqlView.updateLogGraph} onChange={e => handleGraphNameChange(e.target.value)} required />
        </FloatingLabel>
      }
    </>
  );
}

function RestrictedVariablesForm({ sparqlView, handleRestrictedVariablesChange, variablesFromQuery }) {
  const [isRestrictedVariables, setIsRestrictedVariables] = React.useState(sparqlView.restrictedVariable?.length > 0 ? true : false);
 
  function handleSwitchChange(newCheckState) {
    if (newCheckState === true) {
      setIsRestrictedVariables(true);
      handleRestrictedVariablesChange([]);
    } else {
      setIsRestrictedVariables(false);
      handleRestrictedVariablesChange(undefined);
    }
  }
  
  if (isRestrictedVariables) {
    // remove restrictedVars from SparqlView which are not present in the query; update view if necessary
    const filteredRestrVars = sparqlView.restrictedVariable.filter(viewRestrVar => variablesFromQuery.includes(viewRestrVar));
    if (filteredRestrVars.length < sparqlView.restrictedVariable.length) {
      handleRestrictedVariablesChange(filteredRestrVars);
    }
  }

  return (
    <>
      <Form.Check type="switch" className="form-switch-md" size="lg" id="formUpdateLogGraphSwitch" checked={isRestrictedVariables} onChange={e => handleSwitchChange(e.target.checked)} />
      { isRestrictedVariables &&   
        <Form.Control as="select" multiple value={sparqlView.restrictedVariable} onChange={e => handleRestrictedVariablesChange([].slice.call(e.target.selectedOptions).map(item => item.value))}>
          {variablesFromQuery.map( queryVar => ( <option key={queryVar} value={queryVar}>{queryVar}</option>) )}
        </Form.Control>
      }
    </>
  );
}