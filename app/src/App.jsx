import React from 'react';

//import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/bootstrap-custom.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import AppContainer from './components/AppContainer';
import SparqlViewList from './components/sparqlview/SparqlViewList';

export default function App() {
  return (
    <AppContainer>
      <SparqlViewList />
    </AppContainer>
  );
}