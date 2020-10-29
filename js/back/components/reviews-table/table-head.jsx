// @flow

import type {Node} from "React";import React from 'react';
import { TableHead, TableRow, TableSortLabel, TableCell } from 'material-ui/Table';
import type { ListOrder, ListOrderDirection } from 'common/types';
import Tooltip from 'material-ui/Tooltip';
import type { Column } from './types';

type Props = {
  columns: Array<Column>,
  onRequestSort: (ListOrder)=>void,
  orderDir: ListOrderDirection,
  order: ListOrder,
};

class EnhancedTableHead extends React.PureComponent<Props> {

  render(): Node {
    const { columns, order, orderDir } = this.props;

    return (
      <TableHead>
        <TableRow>
          {columns.map(column => (
            <TableCell
              key={column.id}
              padding={column.disablePadding ? 'none' : 'dense'}
              numeric={column.id === 'actions'}
              sortDirection={order === column.id ? orderDir : false} >
              { this.renderLabel(column) }
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  renderLabel: ((column: Column) => Node | string) = (column: Column) => {
    const { onRequestSort, order, orderDir } = this.props;
    const { sort, label } = column;
    return sort ? (
      <Tooltip
        title={__("Sort")}
        placement='bottom-start'
        enterDelay={300} >
        <TableSortLabel
          active={order === sort}
          direction={orderDir}
          onClick={() => onRequestSort(sort)} >
          { label }
        </TableSortLabel>
      </Tooltip>
    ) : label ;
  }
}

export default EnhancedTableHead;
