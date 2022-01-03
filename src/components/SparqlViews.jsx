import React from 'react';

import '../styles/sparqlviews.css';

import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import CardGroup from 'react-bootstrap/CardGroup';
import Button from 'react-bootstrap/Button'

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

  function addNewHandler(viewToAdd) {
    if (viewToAdd) {
      setViews([...views, viewToAdd]);
      setActiveViewId(viewToAdd.id);
    }
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
            <dl className="row">
              <dt className="col-sm-2">Creator</dt>
              <dd className="col-sm-10">{sparqlView.creator}</dd>
              <dt className="col-sm-2">Modification date</dt>
              <dd className="col-sm-10">{new Date(sparqlView.dateCreated).toLocaleString()}</dd>
            </dl>
            <SparqlViewDetail sparqlView={sparqlView} isEditMode={false} />
          </>
        }
      </Card.Body>
    </Card>
  );
}

function AddNewSparqlViewCard({ addNewHandler }) {

  function createBlankView() {
    const newView = SparqlViewFactory.createFrom();
    addNewHandler(newView);
  }

  // load local file
  const fileInputElement = React.useRef();
  const openConfigFileDialog = () => {
      fileInputElement.current.value = null; // reset input
      fileInputElement.current.click();
    }
    function fileSelectedHandler(e) {
    Array.from(e.target.files).forEach(file => {
      console.log(file.name);
      const reader = new FileReader();
      reader.onload = async e => {
        const fileContent = reader.result;
        let newView;
        try {
          newView = await SparqlViewFactory.createFromRDF(fileContent);
        } catch (error) {
          alert(`Error parsing the JSON-LD config file '${file.name}'.`);
        }
        // TODO: updating the state only works for the first file
        // Possible solution: collect every new view and update the React state once
        addNewHandler(newView);
      };
      const errFnc = error => alert(`Error reading the file '${file.name}'\n${error.message}`);
      reader.onerror = reader.onabort = errFnc;
      reader.readAsText(file);
    });
  }

  return (
    <CardGroup>
      <Card key="addBlankCard" className="text-center px-4">
        <Card.Body>
          <Card.Title>Create blank view</Card.Title>
          <Card.Text>Add a new blank view to the list.</Card.Text>
          <div className="d-grid gap-2">
            <Button variant="outline-primary" onClick={createBlankView}><i className="bi bi-plus-lg"></i></Button>
          </div>
        </Card.Body>
      </Card>
      <Card key="addNewCardFromFile" className="text-center px-4">
        <Card.Body>
          <Card.Title>Load config file</Card.Title>
          <Card.Text>Load a local view config file.</Card.Text>
          <div className="d-grid gap-2">
            <Button variant="outline-primary" onClick={openConfigFileDialog}><i className="bi bi-folder2-open"></i></Button>
            <input type="file" ref={fileInputElement} onInput={e => fileSelectedHandler(e)} style={{opacity: 0}} 
              accept=".json,.jsonld,.txt" />
          </div>
        </Card.Body>
      </Card>
      <Card key="addNewCardFromSolid" className="text-center px-4">
        <Card.Body>
          <Card.Title>Load config from SOLID</Card.Title>
          <Card.Text>Load a view config from a SOLID POD.</Card.Text>
          <div className="d-grid gap-2">
            <Button variant="outline-primary" disabled><i className="bi bi-cloud-arrow-down"></i></Button>
          </div>
        </Card.Body>
      </Card>
    </CardGroup>
  );
}
