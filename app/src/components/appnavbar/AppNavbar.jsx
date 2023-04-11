import React from 'react';

import { useSession } from '@inrupt/solid-ui-react';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import { AppNavbarSolid, AppNavbarSolidLogin } from './AppNavbarSolid';

export default function AppNavbar() {
  const { session } = useSession();

  return (
    <Navbar bg="light" variant="light" className="mb-4">
      <Container>
        <Navbar.Brand>
          <img alt="SPARQL_edit" src="logo_cs.png" height="40" className="d-inline-block" />
          <h2 className="d-inline-block align-middle mx-2 my-1">SPARQL_edit</h2>
        </Navbar.Brand>
        <Nav className="justify-content-end">
          { session.info.isLoggedIn ? <AppNavbarSolid webId={session.info.webId} /> : <AppNavbarSolidLogin /> }
        </Nav>
      </Container>
    </Navbar>
  );
}