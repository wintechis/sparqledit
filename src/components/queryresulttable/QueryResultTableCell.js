import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import '../../styles/tooltip.css';

export default function QueryResultTableCell({ rawUri, prefixUri }) {

  let displayJSX = <span>{rawUri}</span>;
  if (prefixUri && prefixUri.indexOf(':') > 0) {
    const i = prefixUri.indexOf(':');
    const prefix = prefixUri.substring(0,i);
    const name = prefixUri.substring(i+1,prefixUri.length);
    displayJSX = <span>{prefix}:<strong>{name}</strong></span>
  }

  return (
    <td className="text-break px-2">
      <OverlayTrigger placement="top" delay={{ show: 280, hide: 800 }} overlay={
        <Tooltip className="tooltip-light text-nowrap">
          <div className="m-1">
            <a href={rawUri} target="_blank" rel="noopener noreferrer">{rawUri}</a>
          </div>
        </Tooltip>
      }>
        {displayJSX}
      </OverlayTrigger>
    </td>
  );
}