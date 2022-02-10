import React from 'react';

import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { useSession } from '@inrupt/solid-ui-react';

import SparqlViewDetail from './SparqlViewDetail';
import SparqlViewListActiveSolidModal from './SparqlViewListActiveSolidModal';

export default function SparqlViewListActive({ view, viewUpdateCallback, cardHandler }) {
  const [activeTabKey, setActiveTabKey] = React.useState('view');
  const [solidModalShow, setSolidModalShow] = React.useState(false);
  const { session } = useSession();
  const isLoggedIn = session.info.isLoggedIn;

  return (
    <Card className="shadow">
      <Card.Header>
        <div className="d-flex pr-2 justify-content-between flex-wrap">
        <h5>{view.name}</h5>
        <Nav variant="tabs" activeKey={activeTabKey} onSelect={(k) => setActiveTabKey(k)}>
          <Nav.Item className="viewCardTab">
            <Nav.Link eventKey="view"><i className="bi bi-cardTab bi-table"></i> View</Nav.Link>
          </Nav.Item>
          <Nav.Item className="viewCardTab">
            <Nav.Link eventKey="edit"><i className="bi bi-cardTab bi-pencil-square"></i> Edit</Nav.Link>
          </Nav.Item>
          <NavDropdown title={<><i className="bi bi-cardTab bi-wrench"></i> Manage</>} id="nav-dropdown" align="end" className="viewCardTab">
            <NavDropdown.Item onClick={() => cardHandler.clone(view)}><i className="bi bi-front"></i> Duplicate view</NavDropdown.Item>
            <NavDropdown.Item onClick={() => cardHandler.save(view)}><i className="bi bi-file-earmark-arrow-down"></i> Save config file</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setSolidModalShow(true)} 
              disabled={!isLoggedIn} title={!isLoggedIn ? 'login with Solid to use this feature' : ''} style={{pointerEvents: 'auto'}}>
              <img alt="Solid" src="solid_bw.svg" height="20" style={!isLoggedIn ? {opacity:0.33} : {}} />  Upload to Pod
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item className="text-danger" onClick={() => cardHandler.delete(view)}><i className="bi bi-trash"></i> Delete</NavDropdown.Item>
          </NavDropdown>
        </Nav>
        <SparqlViewListActiveSolidModal key={Math.random()} show={solidModalShow} onHide={() => setSolidModalShow(false)} sparqlView={view} />
        </div>
      </Card.Header>
      <Card.Body>
        { activeTabKey === 'edit' ? 
          <SparqlViewDetail sparqlView={view} sparqlViewUpdateCallback={viewUpdateCallback} /> :
          <>
            <Card.Text>{view.description}</Card.Text>
            <dl className="row">
              <dt className="col-sm-2">Creator</dt>
              <dd className="col-sm-10">{view.creator}</dd>
              <dt className="col-sm-2">Modification date</dt>
              <dd className="col-sm-10">{new Date(view.dateCreated).toLocaleString()}</dd>
            </dl>
            <SparqlViewDetail sparqlView={view} isEditMode={false} />
          </>
        }
      </Card.Body>
    </Card>
  );
}