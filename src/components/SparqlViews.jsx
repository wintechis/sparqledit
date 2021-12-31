import React from 'react';

import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import Nav from 'react-bootstrap/Nav';

import SparqlViewFactory from '../scripts/models/SparqlViewFactory';
import SparqlViewDetail from './SparqlViewDetail';

export default function SparqlViews() {
  const initialViews = [
    SparqlViewFactory.newSparqlViewExample(),
    SparqlViewFactory.newSparqlViewAdvancedExample()
  ];
  const [views, setViews] = React.useState(initialViews);
  const [activeView, setActiveView] = React.useState(0);

  function handleActiveCardChange(idx) {
    setActiveView(idx);
  }

  function addNewHandler(e) {
    setViews([...views, SparqlViewFactory.newBlankSparqlView()]);
    setActiveView(views.length);
  }

  return (
    <>
      <section>
        <h3>{'SPARQL views: ' + views.length}</h3>
        <Stack gap={3}>
          {views.map( (view, idx) => (
            idx === activeView ? 
            <ActiveSparqlViewCard idx={idx} handleActiveCardChange={handleActiveCardChange} sparqlView={view} /> :
            <Card key={idx} onClick={() => handleActiveCardChange(idx)}>
              <Card.Header><h5>{view.name}</h5></Card.Header>
              <Card.Body>
                <Card.Text>{view.description}</Card.Text>
              </Card.Body>
            </Card>
          ))}
          <AddNewSparqlViewCard addNewHandler={addNewHandler} />
        </Stack>
      </section>
      {/* <section className='mt-4'>
        { views[activeView] && <SparqlViewDetail key={Math.random()} sparqlView={views[activeView]} /> }
      </section> */}
    </>
  );
}

function ActiveSparqlViewCard({ idx, handleActiveCardChange, sparqlView }) {
  const [activeTabKey, setActiveTabKey] = React.useState('view');

  return (
    <Card key={idx} border="primary" onClick={() => handleActiveCardChange(idx)}>
    <Card.Header>
        <Nav variant="tabs" activeKey={activeTabKey} onSelect={(k) => setActiveTabKey(k)}>
          <Nav.Item>
            <Nav.Link eventKey="view">View</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="edit">Edit</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="delete" disabled>Delete</Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        <Card.Title>{sparqlView.name}</Card.Title>
        <Card.Text>{sparqlView.description}</Card.Text>
        <SparqlViewDetail key={Math.random()} sparqlView={sparqlView} isEditMode={activeTabKey === 'edit'} />
      </Card.Body>
    </Card>
  );
}

function AddNewSparqlViewCard({ addNewHandler }) {
  return (
    <Card key="addNewCard" onClick={addNewHandler}>
      <Card.Body>
        <div className="d-flex justify-content-center">
          <i className="bi bi-plus-lg"></i>
          <p>create blank view</p>
        </div>
      </Card.Body>
    </Card>
  );
}


