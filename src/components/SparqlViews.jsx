import React from 'react';

import '../styles/sparqlviews.css';

import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import SparqlViewsActiveCard from './SparqlViewsActiveCard';
import SparqlViewsAddNewControls from './SparqlViewsAddNewControls';

import SparqlViewFactory from '../scripts/models/SparqlViewFactory';
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

  function sparqlViewUpdate(sparqlViewRef) {
    if (sparqlViewRef) {
      setViews([...views]);
    }
  }

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
    <section>
      
      <Row className="justify-content-center mb-2">
        <Col lg="6">
          <h3 className="text-center">{views.length + ' SPARQL views'}</h3>
          <p className="infoText px-2">
            A "SPARQL view" is a simple configuration object. It defines how to load a table of values from a Knowledge Graph. SPARQL_edit allows you to edit literal values in the table.
          </p>
        </Col>
      </Row>

      <Stack gap={3}>
        {views.map( view => (
          view.id === activeViewId ?
            <SparqlViewsActiveCard key={view.id} sparqlView={view} sparqlViewUpdateCallback={sparqlViewUpdate} handleDeleteCard={handleDeleteCard} handleCloneCard={handleCloneCard} handleSaveCard={handleSaveCard} /> :
            <Card key={view.id} onClick={() => handleActiveCardChange( view.id )}>
              <Card.Header><h5>{view.name}</h5></Card.Header>
              <Card.Body>
                <Card.Text>{view.description}</Card.Text>
              </Card.Body>
            </Card>
        ) )}
        <SparqlViewsAddNewControls addNewHandler={addNewHandler} />
      </Stack>
    </section>
  );
}
