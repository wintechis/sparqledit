import React from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import { useSession } from "@inrupt/solid-ui-react";
import { LoginButton, LogoutButton } from "@inrupt/solid-ui-react";
import AppNavbarSolidProfile from './AppNavbarSolidProfile';

export default function AppNavbar() {
  const { session } = useSession();
  const [idp, setIdp] = React.useState("https://inrupt.net");
  const [currentUrl, setCurrentUrl] = React.useState("https://localhost:3000");

  React.useEffect(() => {
    setCurrentUrl(window.location.href);
  }, [setCurrentUrl]);

  function logInOutError(error) {
    console.error(error);
    alert(error.message);
  }

  return (
    <Navbar bg="light" variant="light" className="mb-4">
      <Container>
        <Navbar.Brand>
          <img alt="SPARQL_edit" src="logo_cs.png" height="40" className="d-inline-block" />
          <h2 className="d-inline-block align-middle mx-2">SPARQL_edit</h2>
        </Navbar.Brand>
        <Nav className="justify-content-end">
          { session.info.isLoggedIn ? 
            <Nav.Item>
              <AppNavbarSolidProfile webId={session.info.webId} />
              <LogoutButton onError={logInOutError}>
                <Button>SOLID logout</Button>
              </LogoutButton>
            </Nav.Item> :
            <Nav.Item>
              <input id="idp" label="IDP" placeholder="Identity Provider" value={idp} onChange={( e ) => setIdp( e.target.value )} hidden />
              <LoginButton authOptions={{ clientName: "SPARQL_edit" }} oidcIssuer={idp} redirectUrl={currentUrl} onError={logInOutError}>
                <Button>SOLID login</Button>
              </LoginButton>
            </Nav.Item>
          }
        </Nav>
      </Container>
    </Navbar>
  );
}