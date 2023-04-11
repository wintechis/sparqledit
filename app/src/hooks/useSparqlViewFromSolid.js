import React from 'react';
import { getContentType } from "@inrupt/solid-client";
import SparqlViewFactory from '../scripts/models/SparqlViewFactory';
import useFileFromSolid from './useFileFromSolid';

async function generateSparqlViewFromSolidFile(file) {
  const fileContent = await file.text();
  const contentType = getContentType(file);
  // parse RDF and create new SparqlViews
  const newSparqlView = await SparqlViewFactory.createFromRDF(fileContent, contentType);
  console.log(newSparqlView);
  return newSparqlView;
}

export default function useSparqlViewFromSolid(fileURL) {
  const fetchState = useFileFromSolid(fileURL);
  const initialState = {
    loading: fetchState.loading,
    error: fetchState.error,
    view: null
  };
  const [state, setState] = React.useState(initialState);

  React.useEffect( () => {
    async function processSolidFile(file) {
      try {
        const newSparqlView = await generateSparqlViewFromSolidFile(file);
        setState({
          loading: false,
          error: null,
          view: newSparqlView
        });
      } catch (error) {
        setState({
          loading: false,
          error: error,
          view: null
        });        
      }
    }
    if (fetchState.file) {
      processSolidFile(fetchState.file);
    }
    setState({
      loading: fetchState.loading,
      error: fetchState.error,
      view: null
    });
  }, [fetchState]);
  
  return state;
}