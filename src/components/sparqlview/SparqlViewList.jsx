import React from 'react';

import '../../styles/sparqlviewlist.css';

import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';

import SparqlViewListActive from './SparqlViewListActive';
import SparqlViewListAddControls from './SparqlViewListAddControls';

import SparqlViewFactory from '../../scripts/models/SparqlViewFactory';
import useLocalStorage from '../../hooks/useLocalStorage';
import { createDowloadFileName } from '../../scripts/utilities';

export default function SparqlViewList() {
  const initialViews = [
    SparqlViewFactory.createFrom('simple'),
    SparqlViewFactory.createFrom('advanced')
  ];
  const [views, setViews] = useLocalStorage('sparqlViews', initialViews);
  const initialActiveViewId = views[0]?.id || ''; // first view's id
  const [activeViewId, setActiveViewId] = React.useState(initialActiveViewId);

  function sparqlViewUpdate(sparqlViewRef) {
    if (sparqlViewRef) {
      setViews([...views]);
    }
  }

  function handleActiveCardChange(id) {
    setActiveViewId(id);
  }

  function addNewSparqlViews(viewsToAdd) {
    if (viewsToAdd && viewsToAdd.length > 0) {
      setViews([...views, ...viewsToAdd]);
      setActiveViewId(viewsToAdd[0].id);
    }
  }

  // delete, restore, clean deleted views
  function handleDeleteCard(viewToDelete) {
    // mark view as deleted so that it can be restored later
    setViews(views.map( view => {
      if (view.id === viewToDelete.id) {
        view.deleted = true;
      }
      return view;
    }));
  }
  function handleRestoreDeletedCard(viewToRestore) {
    delete viewToRestore.deleted;
    setViews([...views]);
    setActiveViewId(viewToRestore.id);
  }
  // trigger final removal of deleted views when active view changes
  React.useEffect(()=>{
    if (views.some( view => view.deleted )) {
      setViews(views.filter( view => !view.deleted ))
    }
  }, [activeViewId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCloneCard(viewToCopy) {
    const clonedView = SparqlViewFactory.createFrom(viewToCopy);
    clonedView.name += ' (copy)';
    const insertIndex = views.findIndex(view => view.id === viewToCopy.id) + 1;
    if (insertIndex > 0) {
      views.splice(insertIndex, 0, clonedView); // insert clone after cloned view
    } else {
      views.push(clonedView); // fallback: add to the end
    }
    setViews([...views]);
  }

  async function handleSaveCard(viewToSave) {
    const sparqlViewInstance = SparqlViewFactory.createFrom(viewToSave);
    const jsonldStr = await sparqlViewInstance.serializeToJsonld();
    console.log(await sparqlViewInstance.serializeToTurtle());
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
    <section>
      <Row className="justify-content-center mb-2">
        <Col lg="6">
          <h3 className="text-center">{views.length + ' SPARQL views'}</h3>
          <p className="infoText px-2">
            A "SPARQL view" is a simple configuration object. It defines how to load a table of values from a Knowledge Graph. SPARQL_edit allows you to edit literal values in the table.
          </p>
        </Col>
      </Row>
      <Stack gap={4}>
        {views.map( view => (
          view.deleted ? <SparqlViewListItemDeleted key={view.id} view={view} restoreDeletedView={handleRestoreDeletedCard} /> :
          view.id === activeViewId ?
            <SparqlViewListActive key={view.id} sparqlView={view} sparqlViewUpdateCallback={sparqlViewUpdate} 
              handleDeleteCard={handleDeleteCard} handleCloneCard={handleCloneCard} handleSaveCard={handleSaveCard} /> :
            <SparqlViewListItem key={view.id} view={view} handleActiveCardChange={handleActiveCardChange} />
        ) )}
        <SparqlViewListAddControls key="addControlsKey" addNewSparqlViews={addNewSparqlViews} />
      </Stack>
    </section>
  );
}

function SparqlViewListItem({ view, handleActiveCardChange }) {
  return (
    <Card key={view.id} onClick={() => handleActiveCardChange( view.id )} className="shadow-sm mx-4">
      <Card.Header><h5>{view.name}</h5></Card.Header>
      <Card.Body>
        <Card.Text>{view.description}</Card.Text>
      </Card.Body>
    </Card>
  );
}

function SparqlViewListItemDeleted({ view, restoreDeletedView }) {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <span>View "{view.name}" deleted.</span>
      <Button variant='link' onClick={e => restoreDeletedView(view)}>Restore this view?</Button>
    </div>
  );
}