// @flow

import type { ComponentType } from 'react';
import type { GradingShapeType, ReviewType } from 'common/types';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
} from 'material-ui/Table';
import Typography from 'material-ui/Typography';
import Tooltip from 'material-ui/Tooltip';
import IconButton from 'material-ui/IconButton';
import ApproveIcon from 'material-ui-icons/Check';
import RejectButton from 'material-ui-icons/Delete';
import UndeleteButton from 'material-ui-icons/Undo';
import Paper from 'material-ui/Paper';
import EnhancedTableHead from './table-head';
import EnhancedTableToolbar from './table-toolbar';
import Grading from 'common/components/grading/grading';
import { hasRatings, averageGrade } from 'common/utils/reviews';

type InputProps = {
  onSetOrder: (orderBy: string, order: 'desc' | 'asc') => void,
  onChangePage: (number) => void,
  onChangeRowsPerPage: (number) => void,
  approveReview: (id: number) => void,
  deleteReview: (id: number) => void,
  undeleteReview: (id: number) => void,
  //
  title: string,
  emptyLabel: string,
  shape: GradingShapeType,
  // list data
  order: 'asc' | 'desc',
  orderBy: ?string,
  page: number,
  rowsPerPage: number,
  total: number,
  // page data
  data: Array<ReviewType>,
}

type Props = InputProps & {
  classes: any
}

const columnsData = [
  { id: 'product', disablePadding: false, label: 'Product' },
  { id: 'author', disablePadding: true, label: 'Author' },
  { id: 'grade', disablePadding: false, label: 'Ratings' },
  { id: 'title', disablePadding: true, label: 'Review title' },
  { id: 'content', disablePadding: true, label: 'Review content' },
  { id: 'actions', disablePadding: false, label: 'Actions', disableSort: true },
];

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 4,
  },
  table: {
    minWidth: 800,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  underReview: {
    backgroundColor: '#FFFEE1'
  },
  deleted: {
    backgroundColor: '#FF8784'
  },
});

class EnhancedTable extends React.Component<Props> {

  render() {
    const { shape, emptyLabel, title, classes, total, data, order, orderBy, rowsPerPage, page, onChangePage, onChangeRowsPerPage } = this.props;
    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar title={title} total={total} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <EnhancedTableHead
              columns={columnsData}
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              rowCount={total}
            />
            <TableBody>
              {data.map((review: ReviewType) => {
                const { id, product, title, content, customer, displayName  } = review;
                const ratings = hasRatings(review) ;
                const grade = averageGrade(review);
                return (
                  <TableRow tabIndex={-1} key={id} className={this.getReviewRowClass(review)}>
                    <TableCell padding="dense">
                      { product }
                    </TableCell>
                    <TableCell padding="none">
                      { customer || displayName}
                    </TableCell>
                    <TableCell padding="dense" style={{width: 100}}>
                      { ratings ? (
                        <Grading size={16} grade={grade} shape={shape} />
                      ) : '-'}
                    </TableCell>
                    <TableCell padding="none">
                      { title }
                    </TableCell>
                    <TableCell padding="none">
                      { content }
                    </TableCell>
                    <TableCell padding="dense" numeric={true}>
                      { this.renderActions(review) }
                    </TableCell>
                  </TableRow>
                );
              })}
              {total == 0 && (
                <TableRow style={{ height: 300 }}>
                  <TableCell colSpan={columnsData.length}>
                    <Typography type='display2' style={{textAlign: 'center', color: '#999'}}>
                      { emptyLabel }
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={5}
                  count={total}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={(e, page) => onChangePage(page)}
                  onChangeRowsPerPage={e => onChangeRowsPerPage(e.target.value)}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Paper>
    );
  }

  renderActions = (review: ReviewType) => {
    const { approveReview, deleteReview, undeleteReview } = this.props;
    const actions = [];
    if (review.deleted) {
      actions.push(
        <Tooltip key="undelete" title={'Undelete'}>
          <IconButton onClick={e => undeleteReview(review.id)}>
            <UndeleteButton />
          </IconButton>
        </Tooltip>
      );
    } else {
      if (review.underReview) {
        actions.push(
          <Tooltip key="approve" title={'Approve'}>
            <IconButton onClick={e => approveReview(review.id)}>
              <ApproveIcon />
            </IconButton>
          </Tooltip>
        );
      }
      actions.push(
        <Tooltip key="reject" title={'Delete'}>
          <IconButton onClick={e => deleteReview(review.id)}>
            <RejectButton />
          </IconButton>
        </Tooltip>
      );
    }
    return actions;
  }

  handleRequestSort = (property: string) => {
    const { order, onSetOrder } = this.props;
    onSetOrder(property, order === 'desc' ? 'asc' : 'desc');
  };

  getReviewRowClass = (review: ReviewType) => {
    const classes = this.props.classes;
    if (review.deleted) {
      return classes.deleted;
    }
    if (review.underReview) {
      return classes.underReview;
    }
    return null;
  }
}

const Component: ComponentType<InputProps> = withStyles(styles)(EnhancedTable);
export default Component;
