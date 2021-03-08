import React from 'react';
import './NoFilesFoundStub.css';
import {SVG} from '@opuscapita/react-svg';
const nothingToShowIcon = require('@opuscapita/svg-icons/lib/add_to_photos.svg');

// TODO Add localization
const stub = () => (
  <div className="oc-fm--no-files-found-stub">
    <SVG
      className="oc-fm--no-files-found-stub__icon"
      svg={nothingToShowIcon}
    />
    <div className="oc-fm--no-files-found-stub__title">
      Nothing to show
    </div>
    <div className="oc-fm--no-files-found-stub__sub-title">
      Use toolbar or context menu to perform available actions
    </div>
    {/*
    <div className="oc-fm--no-files-found-stub__sub-title">
      Drop files here or use "New" button
    </div>
    */}
  </div>
);
export default stub;
