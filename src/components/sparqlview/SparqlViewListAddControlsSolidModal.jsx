import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

import { fetch } from '@inrupt/solid-client-authn-browser';
import { getFile, isRawData, getContentType, getSourceUrl, } from "@inrupt/solid-client";
import SparqlViewFactory from '../../scripts/models/SparqlViewFactory';
//import { getSolidDataset, toRdfJsDataset } from "@inrupt/solid-client";

export default function QueryResultTableInputCellModal({ show, onHide, addNewSparqlViews }) {
  const [fileUrl, setFileUrl] = React.useState('');

  async function submitHandler(e) {
    e.preventDefault();
    console.log('submit');

    // // fetch SolidDataset
    // const myDataset = await getSolidDataset(
    //   fileUrl, {
    //   fetch: fetch
    // });
    // console.log(myDataset); // not RDF/JS compatible
    // const datasetCore = toRdfJsDataset(myDataset); // return weird DatasetCore
    // console.log(datasetCore); // no idea what to do with it

    // fetch raw file
    const file = await getFile(fileUrl, { fetch: fetch });
    console.log( `Fetched a ${getContentType(file)} file from ${getSourceUrl(file)}.`);
    console.log(`The file is ${isRawData(file) ? "not " : ""}a dataset.`);
    const fileContent = await file.text();
    const contentType = getContentType(file);
    
    // parse and create new SparqlViews
    const newSparqlView = await SparqlViewFactory.createFromRDF(fileContent, contentType);
    console.log(newSparqlView);

    // add to list and close modal if successful
    addNewSparqlViews([newSparqlView]);
    onHide();
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" dialogClassName="modal-90w" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Load config from Solid Pod
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Please insert the <strong>URL to a "SPARQL view" config file</strong> on a Solid Pod you have access to:</p>
        <Form onSubmit={submitHandler}>
          <FormControl type="url" className="my-2" onChange={( e ) => setFileUrl(e.target.value)} value={fileUrl} 
            placeholder="https://pod.example.org/private/sparqlviews/view1.ttl" />
          <Button type="submit"><i className="bi bi-play-fill"></i> load from Pod</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
