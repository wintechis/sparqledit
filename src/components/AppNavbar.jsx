import React from 'react';

import '../styles/appnavbar.css';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { useSession } from '@inrupt/solid-ui-react';
import { LoginButton, LogoutButton } from '@inrupt/solid-ui-react';
import AppNavbarSolidProfile from './AppNavbarSolidProfile';

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

function AppNavbarSolid({ webId }) {
  const logInOutError = (error) => {
    console.error(error);
    alert(error.message);
  }
  const openProfileInNewTab = () => window.open( webId, '_blank' );

  return (
    <NavDropdown id="nav-dropdown-solid" drop="down" align="end" className="no-padding-in-children" title={
      <div style={{ display: "inline-block", verticalAlign: "middle" }}>
        <AppNavbarSolidProfile webId={webId} />
      </div>
    }>
      <NavDropdown.Item onClick={openProfileInNewTab}><i className="bi bi-person-fill"></i>Open profile</NavDropdown.Item>
      <LogoutButton onError={logInOutError}>
        <NavDropdown.Item><i className="bi bi-door-open-fill"></i> Solid logout</NavDropdown.Item>
      </LogoutButton>
    </NavDropdown>
  );
}

function AppNavbarSolidLogin() {
  const authOptions = { clientName: "SPARQL_edit" };
  const [currentUrl, setCurrentUrl] = React.useState("https://localhost:3000");
  const [customIdp, setCustomIdp] = React.useState("https://idp.example.org");

  React.useEffect(() => {
    setCurrentUrl(window.location.href);
  }, [setCurrentUrl]);

  const logInOutError = (error) => {
    console.error(error);
    alert(error.message);
  }

  return (
    <NavDropdown id="nav-dropdown-solidlogin" drop="down" align="end" className="no-padding-in-children" title={
      <div style={{ display: "inline-block", verticalAlign: "middle" }}>
        <span className="mx-2">Login with</span>
        <img alt="Solid" src="solid.svg" height="45" className="d-inline-block" />
      </div>
    }>
      <NavDropdown.Header>choose your identity provider ...</NavDropdown.Header>
      <NavDropdown.Item>
        <LoginButton authOptions={authOptions} oidcIssuer={'https://solidcommunity.net'} redirectUrl={currentUrl} onError={logInOutError}>
          solidcommunity.net
        </LoginButton>
      </NavDropdown.Item>
      <NavDropdown.Item>
        <LoginButton authOptions={authOptions} oidcIssuer={'https://inrupt.net'} redirectUrl={currentUrl} onError={logInOutError}>
        inrupt.net
        </LoginButton>
      </NavDropdown.Item>
      <InputGroup className="mt-2 customIDPInputGroup">
        <FormControl className="customIDPFormControl" aria-label="custom IDP" aria-describedby="customIDPButton" size="sm" type="url"
          onChange={( e ) => setCustomIdp( e.target.value )} value={customIdp} />
        <LoginButton authOptions={authOptions} oidcIssuer={customIdp} redirectUrl={currentUrl} onError={logInOutError}>
          <Button type="submit" variant="outline-secondary" id="customIDPButton"><i className="bi bi-play-fill"></i></Button>
        </LoginButton>
      </InputGroup>
    </NavDropdown>
  );
}