import React from 'react';

import { SessionProvider } from "@inrupt/solid-ui-react";

import Container from 'react-bootstrap/Container';
import AppNavbar from './appnavbar/AppNavbar';
import LegalModal from './LegalModal';

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
  const [showLegalModal, setShowLegalModal] = React.useState(false);
  const version = process.env.REACT_APP_VERSION || '0.5';

  const legalClickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLegalModal(true);
    return false;
  }

  return (
    <>
      <footer className="footer">
        <hr className="customSeparatorLine" />
        <div className="d-flex justify-content-center mb-1">
          <span className="text-secondary fw-light mx-2">SPARQL_edit (v{version}) - <a className="text-secondary fw-light" href="/" onClick={legalClickHandler}>legal notice / impressum</a>
          </span>
        </div>
      </footer>
      <LegalModal show={showLegalModal} onHide={() => setShowLegalModal(false)} />
    </>
  );
}