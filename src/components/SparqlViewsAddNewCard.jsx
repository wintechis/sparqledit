import React from 'react';

import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import Button from 'react-bootstrap/Button'

import SparqlViewFactory from '../scripts/models/SparqlViewFactory';

export default function SparqlViewsAddNewCard({ addNewHandler }) {

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
