import React from 'react';
import './Cell.less';
import LoadingCell from '../LoadingCell';

const cell = (viewLayoutOptions) => (cellProps) => {
  if (viewLayoutOptions.loading) {
    return (<LoadingCell />);
  }

  const data = viewLayoutOptions.getData ?
    viewLayoutOptions.getData(viewLayoutOptions, cellProps) :
    cellProps.cellData;

  return (
    <div className="oc-fm--cell">
      {data}
    </div>
  );
}
export default cell;
