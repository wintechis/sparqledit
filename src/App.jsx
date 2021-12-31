import React from 'react';

//import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/bootstrap-custom.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import SparqlViews from './components/SparqlViews';

function App() {
  return (
    <>
      <Navbar bg="light" variant="light" className="mb-4">
        <Container>
          <Navbar.Brand>
            <img alt="" src="logo_cs.png" height="40" className="d-inline-block" />
            <h2 className="d-inline-block align-middle mx-2">SPARQL_edit</h2>
          </Navbar.Brand>
          <Nav className="justify-content-end">
            <Nav.Item>
              <Nav.Link className="justify-content-end" href="mailto:sascha.meckler@iis.fraunhofer.de">Contact</Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>
      </Navbar>
      <Container className="App">
        <SparqlViews />
      </Container>
    </>
  );
}

export default App;
