// @flow

import React from 'react';
import { TableHead, TableRow, TableSortLabel, TableCell } from 'material-ui/Table';
import Tooltip from 'material-ui/Tooltip';

type Column = {
  id: string,
  label: string,
  disablePadding?: boolean,
  disableSort?: boolean
}

type Props = {
  columns: Array<Column>,
  onRequestSort: (string)=>void,
  order: 'asc' | 'desc',
  orderBy: ?string,
};

class EnhancedTableHead extends React.PureComponent<Props> {

  render() {
    const { columns, order, orderBy } = this.props;

    return (
      <TableHead>
        <TableRow>
          {columns.map(column => (
            <TableCell
              key={column.id}
              padding={column.disablePadding ? 'none' : 'dense'}
              numeric={column.id === 'actions'}
              sortDirection={orderBy === column.id ? order : false} >
              { this.renderLabel(column) }
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  renderLabel = (column: Column) => {
    const { onRequestSort, order, orderBy } = this.props;
    const { disableSort, label, id } = column;
    return disableSort ? label : (
      <Tooltip
        title="Sort"
        placement='bottom-start'
        enterDelay={300} >
        <TableSortLabel
          active={orderBy === id}
          direction={order}
          onClick={() => onRequestSort(id)} >
          { label }
        </TableSortLabel>
      </Tooltip>
    );
  }
}

export default EnhancedTableHead;
