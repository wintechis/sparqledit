import React from 'react';

import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import SparqlViewDetail from './SparqlViewDetail';

export default function SparqlViewListActive({ sparqlView, sparqlViewUpdateCallback, handleDeleteCard, handleCloneCard, handleSaveCard }) {
  const [activeTabKey, setActiveTabKey] = React.useState('view');

  return (
    <Card className="shadow">
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
            <NavDropdown.Item onClick={() => handleCloneCard(sparqlView)}>Duplicate view</NavDropdown.Item>
            <NavDropdown.Item onClick={() => handleSaveCard(sparqlView)}>Save view config</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item className="text-danger" onClick={() => handleDeleteCard(sparqlView)}><i className="bi bi-trash"></i> Delete</NavDropdown.Item>
          </NavDropdown>
        </Nav>
        </div>
      </Card.Header>
      <Card.Body>
        { activeTabKey === 'edit' ? 
          <SparqlViewDetail sparqlView={sparqlView} sparqlViewUpdateCallback={sparqlViewUpdateCallback} /> :
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