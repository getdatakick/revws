// @flow

import type { ReviewListType, GradingShapeType, ReviewType } from 'common/types';
import type { LoadOptions } from 'back/types';
import { notNil } from 'common/utils/ramda';
import { reject, merge, equals, has } from 'ramda';
import React from 'react';
import ReviewsTable from 'back/components/reviews-table/reviews-table';

type Filters = {
  deleted?: boolean,
  validated?: boolean
}

export type InputProps = {
  shape: GradingShapeType,
  uniqueId: string,
  title: string,
  emptyLabel?: string,
  filters: Filters,
}

type Props = InputProps & {
  data: any,
  loadData: (string, LoadOptions) => void,
  approveReview: (id: number) => void,
  deleteReview: (id: number) => void,
  undeleteReview: (id: number) => void
};

type State = {
  page: number,
  pageSize: number,
  order: 'asc' | 'desc',
  orderBy: string,
  filters: Filters
}

const defaultData: ReviewListType = {
  total: 0,
  page: 0,
  pages: 1,
  pageSize: 10,
  reviews: []
};

class Controller extends React.PureComponent<Props, State> {
  static displayName = 'Controller';

  state = {
    page: 0,
    pageSize: 10,
    orderBy: 'date',
    order: 'desc',
    filters: this.props.filters
  };

  componentDidMount() {
    const { data, uniqueId } = this.props;
    if (!has(uniqueId, data)) {
      this.loadPage(this.state);
    }
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (! equals(this.state, nextState)) {
      this.loadPage(nextState);
    }
    const list = this.getList(nextProps);
    if (list.reviews.length > 0) {
      const filtered = this.filter(list.reviews);
      if (filtered.length === 0) {
        this.loadPage(nextState);
      }
    }
  }

  loadPage = (state: State) => {
    const { uniqueId, loadData } = this.props;
    const { orderBy, order, pageSize, page, filters } = state;
    loadData(uniqueId, merge(filters, {
      productInfo: true,
      customerInfo: true,
      order: {
        direction: order,
        field: orderBy
      },
      page,
      pageSize
    }));
  }

  getList = (props: Props): ReviewListType => {
    const { data, uniqueId } = props;
    const dataDesc: ReviewListType = has(uniqueId, data) ? data[uniqueId] : defaultData;
    return dataDesc;
  };

  render() {
    const { data, uniqueId } = this.props;
    if (has(uniqueId, data)) {
      return this.renderList(data[uniqueId]);
    }
    return null;
  }

  renderList(list: ReviewListType) {
    const { emptyLabel, title, shape, approveReview, deleteReview, undeleteReview } = this.props;
    const { page, pageSize, order, orderBy } = this.state;
    const { total, reviews } = list;
    const filtered = this.filter(reviews);
    const diff = reviews.length - filtered.length;

    return (
      <ReviewsTable
        title={title}
        shape={shape}
        data={filtered}
        total={total - diff}
        page={page}
        order={order}
        orderBy={orderBy}
        rowsPerPage={pageSize}
        onSetOrder={(orderBy, order) => this.setState({ order, orderBy })}
        onChangeRowsPerPage={pageSize => this.setState({ pageSize })}
        onChangePage={page => this.setState({ page })}
        approveReview={approveReview}
        deleteReview={deleteReview}
        undeleteReview={undeleteReview}
        emptyLabel={emptyLabel || 'Nothing found'}
      />
    );
  }

  filter = (reviews: Array<ReviewType>) => {
    return reject(this.hiddenReview, reviews);
  }

  hiddenReview = (review: ReviewType) => {
    const { deleted, underReview } = review;
    const filters = this.state.filters;
    if (notNil(filters.deleted) && deleted !== filters.deleted) {
      return true;
    }
    if (notNil(filters.validated) && underReview === filters.validated) {
      return true;
    }
    return false;
  }
}

export default Controller;
