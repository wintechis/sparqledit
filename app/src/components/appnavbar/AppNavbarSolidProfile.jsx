import React from 'react';

import '../../styles/component-styles/AppNavbarSolidProfile.css';

import { 
  CombinedDataProvider, 
  Image, Text 
} from "@inrupt/solid-ui-react";

import { RDF_NAMESPACES } from '../../scripts/models/RdfNamespaces';

export default function AppNavbarSolidProfile({ webId }) {
  const imageProperty = RDF_NAMESPACES.vcard + 'hasPhoto';
  const nameProperties = [
    RDF_NAMESPACES.vcard + 'fn',
    RDF_NAMESPACES.foaf + 'name'
  ];
  const organizationProperty = RDF_NAMESPACES.vcard + 'organization-name';

  // const errorComponent = ({error}) => <span>{`Unknown user ${error}`}</span>;

  return (
    <CombinedDataProvider datasetUrl={webId} thingUrl={webId} loadingComponent={ProfilePlaceholder}>
      <div className="d-flex align-items-center">
        <div className="image-placeholder">
          <Image property={imageProperty} width={50} className="image-profile" loadingComponent={null} errorComponent={() => <></>} />
        </div>
        <div className="mx-3">
          <h5 className="my-0">
            <Text properties={nameProperties} errorComponent={() => <span>{`Unknown user`}</span>} />
          </h5>
          <small><Text property={organizationProperty} errorComponent={() => <span>-</span>} /></small>
        </div>
      </div>
    </CombinedDataProvider>
  );
}

function ProfilePlaceholder() {
  return (
    <div className="d-flex align-items-center">
      <div className="image-placeholder"></div>
      <div className="mx-3">
          <h5 className="my-0">Username</h5>
          <small>Organization</small>
        </div>
    </div>
  );
}