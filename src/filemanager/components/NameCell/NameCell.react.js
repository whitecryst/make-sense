import React from 'react';
import './NameCell.css';
import {SVG} from '@opuscapita/react-svg';
import LoadingCell from '../LoadingCell';

const nc = ({ loading, getIcon }) => (cellProps) => {
  if (loading) {
    return (<LoadingCell />);
  }

  const { svg, fill } = getIcon(cellProps.rowData);

  return (
    <div className="oc-fm--name-cell">
      <div className="oc-fm--name-cell__icon">
        <SVG
          className="oc-fm--name-cell__icon-image"
          svg={svg}
          style={{ fill }}
        />
      </div>
      <div
        className="oc-fm--name-cell__title"
        title={cellProps.cellData || ''}
      >
        {cellProps.cellData || ''}
      </div>
    </div>
  );
}
export default nc;