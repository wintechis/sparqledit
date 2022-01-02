import React from 'react';

import '../styles/sparqlviews.css';

import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import SparqlViewFactory from '../scripts/models/SparqlViewFactory';
import SparqlViewDetail from './SparqlViewDetail';
import useLocalStorage from '../hooks/useLocalStorage';
import { createDowloadFileName } from '../scripts/utilities';

export default function SparqlViews() {
  const initialViews = [
    SparqlViewFactory.createFrom('simple'),
    SparqlViewFactory.createFrom('advanced')
  ];
  const [views, setViews] = useLocalStorage('sparqlViews', initialViews);
  const initialActiveViewId = views[0]?.id || ''; // first view's id
  const [activeViewId, setActiveViewId] = React.useState(initialActiveViewId);

  function handleActiveCardChange(id) {
    setActiveViewId(id);
  }

  function addNewHandler(e) {
    const newView = SparqlViewFactory.createFrom();
    setViews([...views, newView]);
    setActiveViewId(newView.id);
  }

  function handleDeleteCard(viewToDelete) {
    setViews(views.filter( view => view.id !== viewToDelete.id));
  }

  function handleCloneCard(viewToClone) {
    const clonedView = SparqlViewFactory.createFrom(viewToClone);
    clonedView.name += ' (clone)';
    const insertIndex = views.findIndex(view => view.id === viewToClone.id) + 1;
    if (insertIndex > 0) {
      views.splice(insertIndex, 0, clonedView); // insert clone after cloned view
    } else {
      views.push(clonedView); // fallback: add to the end
    }
    setViews([...views]);
  }

  function handleSaveCard(viewToSave) {
    const sparqlViewInstance = SparqlViewFactory.createFrom(viewToSave);
    const jsonldStr = sparqlViewInstance.serializeToJsonld();
    const file = new Blob([jsonldStr], {type: 'application/ld+json'});
    // create link and program. click it
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `sparqledit_${createDowloadFileName(sparqlViewInstance.name)}.jsonld`;
    document.body.appendChild(element); // required for FireFox
    element.click();
    element.remove(); // cleanup
  }

  return (
    <>
      <section>
        <h3 className="text-center my-4">{views.length + ' SPARQL views'}</h3>
        <Stack gap={3}>
          {views.map( view => (
            view.id === activeViewId ? 
            <ActiveSparqlViewCard key={view.id} sparqlView={view} handleDeleteCard={handleDeleteCard} handleCloneCard={handleCloneCard} handleSaveCard={handleSaveCard} /> :
            <Card key={view.id} onClick={() => handleActiveCardChange(view.id)}>
              <Card.Header><h5>{view.name}</h5></Card.Header>
              <Card.Body>
                <Card.Text>{view.description}</Card.Text>
              </Card.Body>
            </Card>
          ))}
          <AddNewSparqlViewCard addNewHandler={addNewHandler} />
        </Stack>
      </section>
    </>
  );
}

function ActiveSparqlViewCard({ sparqlView, handleDeleteCard, handleCloneCard, handleSaveCard }) {
  const [activeTabKey, setActiveTabKey] = React.useState('view');

  return (
    <Card border="primary">
      <Card.Header>
        <div className="d-flex pr-2 justify-content-between flex-wrap">
        <h5>{sparqlView.name}</h5>
        <Nav variant="tabs" activeKey={activeTabKey} onSelect={(k) => setActiveTabKey(k)}>
          <Nav.Item className="viewCardTab">
            <Nav.Link eventKey="view"><i className="bi bi-cardTab bi-table"></i> View</Nav.Link>
          </Nav.Item>
          <Nav.Item className="viewCardTab">
            <Nav.Link eventKey="edit"><i className="bi bi-cardTab bi-pencil-square"></i> Edit</Nav.Link>
          </Nav.Item>
          <NavDropdown title={<><i className="bi bi-cardTab bi-wrench"></i> Manage</>} id="nav-dropdown" align="end" className="viewCardTab">
            <NavDropdown.Item onClick={() => handleCloneCard(sparqlView)}>Clone view</NavDropdown.Item>
            <NavDropdown.Item onClick={() => handleSaveCard(sparqlView)}>Save view config</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item className="text-danger" onClick={() => handleDeleteCard(sparqlView)}><i className="bi bi-trash"></i> Delete</NavDropdown.Item>
          </NavDropdown>
        </Nav>
        </div>
      </Card.Header>
      <Card.Body>
        { activeTabKey === 'edit' ? <SparqlViewDetail sparqlView={sparqlView} /> :
          <>
            <Card.Text>{sparqlView.description}</Card.Text>
            <SparqlViewDetail sparqlView={sparqlView} isEditMode={false} />
          </>
        }
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
