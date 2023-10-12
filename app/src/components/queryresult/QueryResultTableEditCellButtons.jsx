import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { DataChangeUpdateCheckError } from '../../scripts/CustomErrors';

export default function QueryResultTableEditCellButtons({ handleLiteralUpdate, handleInputReset, openModal, inputCellState }) {

  const anyError = inputCellState.buildingError || inputCellState.updateCheckError || inputCellState.updateError;
  const isDataChanged = inputCellState.updateCheckError instanceof DataChangeUpdateCheckError;

  return (
    <ButtonGroup aria-label="update controls" className="mt-1">
      <Button variant="success" type="submit" alt="update" onClick={e => handleLiteralUpdate(e)} disabled={inputCellState.isExecutingQuery || inputCellState.buildingError}>
        {inputCellState.isExecutingQuery ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> saving …</> : <span><i className="bi bi-pencil-square"></i> save </span>}
      </Button>
      <Button variant="secondary" type="reset" onClick={e => handleInputReset(e)} disabled={inputCellState.isExecutingQuery}>
        <i className="bi bi-arrow-counterclockwise"></i> reset
      </Button>
      {anyError ?
        (isDataChanged ?
          <Button variant="warning" onClick={() => openModal()} disabled={inputCellState.isExecutingQuery}>
            <i className="bi bi-exclamation-square"></i> warn
          </Button> :
          <Button variant="danger" onClick={() => openModal()} disabled={inputCellState.isExecutingQuery}>
            <i className="bi bi-x-square"></i> error
          </Button>) :
        <Button variant="primary" onClick={() => openModal()} disabled={inputCellState.isExecutingQuery}>
          <i className="bi bi-info-square"></i> info
        </Button>
      }
    </ButtonGroup>
  );
}