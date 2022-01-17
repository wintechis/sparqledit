import React from 'react';

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';

import { useSession } from '@inrupt/solid-ui-react';

import SparqlViewListAddControlsSolidModal from './SparqlViewListAddControlsSolidModal';
import SparqlViewFactory from '../../scripts/models/SparqlViewFactory';

export default function SparqlViewListAddControls({ addNewSparqlViews }) {
  const { session } = useSession();
  const [solidModalShow, setSolidModalShow] = React.useState(false);

  function createBlankView() {
    const newView = SparqlViewFactory.createFrom();
    addNewSparqlViews([newView]);
  }

  // load local file
  const fileInputElement = React.useRef();
  const openConfigFileDialog = () => {
      fileInputElement.current.value = null; // reset input
      fileInputElement.current.click();
    }
    function fileSelectedHandler(e) {
    Array.from(e.target.files).forEach(file => {
      console.log(file.name);
      const reader = new FileReader();
      reader.onload = async e => {
        const fileContent = reader.result;
        let newView;
        try {
          newView = await SparqlViewFactory.createFromRDF(fileContent, 'application/ld+json');
        } catch (error) {
          alert(`Error parsing the JSON-LD config file '${file.name}'.`);
        }
        // TODO: updating the state only works for the first file
        // Possible solution: collect every new view and update the React state once
        addNewSparqlViews([newView]);
      };
      const errFnc = error => alert(`Error reading the file '${file.name}'\n${error.message}`);
      reader.onerror = reader.onabort = errFnc;
      reader.readAsText(file);
    });
  }

  return (
    <>
      <ButtonGroup aria-label="Load view configurations" className="mx-4">
        <Button variant="outline-primary border-1" onClick={createBlankView}>
          <i className="bi bi-plus-lg fs-2"></i>
          <p className="text-wrap mb-1 fw-bolder">create blank view</p>
        </Button>
        <Button variant="outline-primary border-1" onClick={openConfigFileDialog}>
          <i className="bi bi-folder2-open fs-2"></i>
          <p className="text-wrap mb-1 fw-bolder">load config file</p>
          <input type="file" ref={fileInputElement} onInput={e => fileSelectedHandler(e)} 
            style={{opacity: 0, display: 'none'}} accept=".json,.jsonld,.txt" />
        </Button>
        <Button variant="outline-primary border-1" onClick={() => setSolidModalShow(true)} disabled={!session.info.isLoggedIn} 
          title={!session.info.isLoggedIn ? 'login with Solid to use this feature' : ''} style={{pointerEvents: 'auto'}}>
          <i className="bi bi-cloud-arrow-down fs-2"></i>
          <p className="text-wrap mb-1 fw-bolder">load config from Solid Pod</p>
        </Button>
      </ButtonGroup>
      <SparqlViewListAddControlsSolidModal show={solidModalShow} onHide={() => setSolidModalShow(false)} addNewSparqlViews={addNewSparqlViews} />
    </>
  );
}
