import React from 'react';

import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

import ErrorBox from '../common/ErrorBox';
import useLocalStorage from '../../hooks/useLocalStorage';
import { createDowloadFileName } from '../../scripts/utilities';
import { SolidError } from '../../scripts/CustomErrors';

import { fetch } from '@inrupt/solid-client-authn-browser';
import { saveFileInContainer, getSourceUrl } from "@inrupt/solid-client";
import SparqlViewFactory from '../../scripts/models/SparqlViewFactory';

export default function SparqlViewListActiveSolidModal({ show, onHide, sparqlView }) {
  const [containerUrl, setContainerUrl] = useLocalStorage('solidContainerUrl', '');
  const [{ loading, successObj, error }, dispatch] = React.useReducer(fetchReducer, defaultInitialState);

  async function uploadViewToContainer(view, targetContainerURL) {
    dispatch({ type: "UPLOAD_START" });
    const jsonldContentType = 'application/ld+json';
    const sparqlViewInstance = SparqlViewFactory.createFrom(view);
    const viewJsonldStr = await sparqlViewInstance.serializeToJsonld();
    const viewFileName = `sparqledit_${createDowloadFileName(view.name)}.jsonld`;
    try {
      const savedFile = await saveFileInContainer(
        targetContainerURL,
        new Blob([viewJsonldStr], { type: jsonldContentType }),
        { slug: viewFileName, contentType: jsonldContentType, fetch: fetch }
      );
      console.log(`File saved at ${getSourceUrl(savedFile)}`, savedFile);
      const uploadResult = { savedFile, fileUrl: getSourceUrl(savedFile)};
      dispatch({
        type: "UPLOAD_SUCCESS",
        successObj: uploadResult
      });
    } catch (error) {
      console.error(error);
      const customError = new SolidError(
        `The file could not be uploaded to the Solid Pod.\n${error.name} - ${error.message}`, 
        targetContainerURL);
      dispatch({
        type: "UPLOAD_FAIL",
        error: customError
      });
    }
  }

  async function submitHandler(e) {
    e.preventDefault();
    console.log('upload');
    uploadViewToContainer(sparqlView, containerUrl);
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" dialogClassName="modal-90w" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Upload view to a Solid Pod
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Please insert the <strong>URL to a Solid container</strong> for which you have 'write' permissions:</p>
        <Form onSubmit={submitHandler}>
          <FormControl type="url" className="my-2" onChange={( e ) => setContainerUrl(e.target.value)} value={containerUrl} 
            placeholder="https://pod.example.org/private/sparqlviews/" required />
          <Button variant="primary" type="submit" disabled={loading} className="col-sm-6 mb-4">
          { loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="mx-2" /> loading … </> : <><i className="bi bi-cloud-arrow-up"></i> upload to Pod </>}
          </Button>
        </Form>
        {error && <ErrorBox error={error} /> }
        {successObj && <UploadSuccessBox successObj={successObj} />}
      </Modal.Body>
    </Modal>
  );
}

function UploadSuccessBox({ successObj }) {
  const [show, setShow] = React.useState(true);
  const alert = (
    <Alert variant="success" onClose={() => setShow(false)} dismissible>
      <Alert.Heading>Successfully uploaded!</Alert.Heading>
      <p>The SPARQL view has been successfully uploaded to the Solid Pod.</p>
      <p><a href={successObj.fileUrl} target="_blank" rel="noreferrer">{successObj.fileUrl}</a></p>
    </Alert>
  );
  return show ? alert : null;
}

const defaultInitialState = {
  loading: false,
  error: null,
  successObj: null
};

export function fetchReducer(state, action) {
  switch (action.type) {
    case "UPLOAD_START":
      return { loading: true, successObj: null, error: null };
    case "UPLOAD_FAIL":
      return { loading: false, successObj: null, error: action.error };
    case "UPLOAD_SUCCESS":
      return { loading: false, successObj: action.successObj, error: null };
    default:
      throw new Error(`Invalid reducer action: ${action.type}`);
  }
}