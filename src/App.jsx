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
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="light" variant="light" className="mb-4">
        <Container>
          <Navbar.Brand>
            <img alt="" src="logo_cs.png" height="40" className="d-inline-block" />
            <h2 className="d-inline-block align-middle mx-2">SPARQL_edit</h2>
          </Navbar.Brand>
          <Nav className="justify-content-end">
            <Nav.Item>
              TODO: SOLID LOGIN
            </Nav.Item>
          </Nav>
        </Container>
      </Navbar>
      <Container className="App flex-fill">
        <SparqlViews />
      </Container>
      <AppFooter />
    </div>
  );
}

function AppFooter() {
  const version = process.env.REACT_APP_VERSION || '0.3';
  return (
    <footer className="footer">
      <hr className="customSeparatorLine" />
      <div className="d-flex justify-content-center">
        <p className="text-secondary">SPARQL_edit (v{version}) by <a href="mailto:sascha.meckler@iis.fraunhofer.de" className="text-secondary">Sascha Meckler</a></p>
      </div>
    </footer>
  );
}

export default App;
