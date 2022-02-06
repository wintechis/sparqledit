import React from 'react';

import { SessionProvider } from "@inrupt/solid-ui-react";

import Container from 'react-bootstrap/Container';
import AppNavbar from './appnavbar/AppNavbar';

export default function AppContainer({ children }) {
  return (
    <SessionProvider>
      <div className="d-flex flex-column min-vh-100">
        <AppNavbar />
        <Container className="App flex-fill">
          { children }
        </Container>
        <AppFooter />
      </div>
    </SessionProvider>
  );
}

function AppFooter() {
  const version = process.env.REACT_APP_VERSION || '0.4';
  return (
    <footer className="footer">
      <hr className="customSeparatorLine" />
      <div className="d-flex justify-content-center">
        <p className="text-secondary fw-light">SPARQL_edit (v{version}) by <a href="mailto:sascha.meckler@iis.fraunhofer.de" className="text-secondary">S. Meckler</a></p>
      </div>
    </footer>
  );
}