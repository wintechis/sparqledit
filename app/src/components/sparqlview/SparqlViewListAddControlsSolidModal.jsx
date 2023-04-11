import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import ErrorBox from '../common/ErrorBox';
import useSparqlViewFromSolid from '../../hooks/useSparqlViewFromSolid';
import useLocalStorage from '../../hooks/useLocalStorage';

export default function SparqlViewListAddControlsSolidModal({ show, onHide, addNewSparqlViews }) {
  const [inputfileUrl, setInputFileUrl] = useLocalStorage('solidFileUrl', '');
  const [submittedFileUrl, setSubmittedFileUrl] = React.useState('');
  const { loading, error, view } = useSparqlViewFromSolid(submittedFileUrl);

  // add new view to list and close modal if successful
  React.useEffect(()=> {
    if (view) {
      addNewSparqlViews([view]);
      onHide();
    }
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitHandler(e) {
    e.preventDefault();
    if (submittedFileUrl === inputfileUrl) {
      setSubmittedFileUrl(''); // reset url
    }
    setTimeout(() => setSubmittedFileUrl(inputfileUrl),30);
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
          <FormControl type="url" className="my-2" onChange={( e ) => setInputFileUrl(e.target.value)} value={inputfileUrl} 
            placeholder="https://pod.example.org/private/sparqlviews/view1.ttl" required />
          <Button variant="primary" type="submit" disabled={loading} className="col-sm-6 mb-4">
          { loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="mx-2" /> loading … </> : <><i className="bi bi-cloud-arrow-down"></i> load from Pod </>}
          </Button>
        </Form>
        {error && <ErrorBox error={error} />}
      </Modal.Body>
    </Modal>
  );
}
