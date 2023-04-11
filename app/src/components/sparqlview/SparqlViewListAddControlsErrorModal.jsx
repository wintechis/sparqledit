import React from 'react';
import Modal from 'react-bootstrap/Modal';

export default function SparqlViewListAddControlsErrorModal({ show, onHide, error }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" dialogClassName="modal-90w" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header className="alert-danger" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Error loading config file
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        { error && 
          <>
            <p>{error.name}</p>
            <p>{error.message}</p>
          </>
        }
      </Modal.Body>
    </Modal>
  );
}