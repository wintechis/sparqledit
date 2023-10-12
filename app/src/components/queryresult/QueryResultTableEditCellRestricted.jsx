import React from 'react';

import Form from 'react-bootstrap/Form';

import getInputTypeForLiteral from '../../scripts/component-scripts/inputCellDatatypeHelper';

export default function QueryResultTableEditCellRestricted({ rowBinding, variable }) {
  
  const { error: datatypeError, value: origValue, inputType, language } = getInputTypeForLiteral(rowBinding[variable]);

  return (
    <>
      <Form>
        {
          {
            'checkbox': <Form.Check type="checkbox" label={origValue} checked={origValue === 'true' ? true : false} disabled />,
            'textarea': <Form.Control as='textarea' value={origValue} lang={language} disabled />
          }[inputType] ||
          <Form.Control type={inputType} value={origValue} lang={language} disabled />
        }
      </Form>
      { datatypeError && <div className="text-warning" title={datatypeError.message}><i className="bi bi-exclamation-triangle"></i><small> RDF datatype incorrect</small></div> }
    </>
  );
}