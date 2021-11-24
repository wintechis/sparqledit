import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

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
      <OverlayTrigger placement={'top'} trigger="click" overlay={
          <Tooltip>
            <a href={rawUri}>{rawUri}</a>
          </Tooltip>
      }>
        {displayJSX}
      </OverlayTrigger>
    </td>
  );
}