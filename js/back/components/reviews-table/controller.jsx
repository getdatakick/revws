// @flow

import type { ReviewListType, GradingShapeType, ReviewType, CriteriaType, DisplayCriteriaType, LanguagesType, ListOrder, ListOrderDirection } from 'common/types';
import type { LoadOptions } from 'back/types';
import type { Filters } from './types';
import { notNil } from 'common/utils/ramda';
import { prop, find, propEq, reject, merge, equals, has } from 'ramda';
import React from 'react';
import ReviewsTable from 'back/components/reviews-table/reviews-table';
import EditReviewDialog from 'back/components/edit-review/edit-review-dialog';

export type InputProps = {
  shopName: string,
  language: number,
  criteria: CriteriaType,
  languages: LanguagesType,
  displayCriteria: DisplayCriteriaType,
  shape: GradingShapeType,
  shapeSize: number,
  uniqueId: string,
  title: string,
  emptyLabel?: string,
  filters: Filters
}

type Props = InputProps & {
  data: any,
  loadData: (string, LoadOptions) => void,
  approveReview: (id: number) => void,
  deleteReview: (id: number) => void,
  deletePermReview: (id: number) => void,
  undeleteReview: (id: number) => void,
  saveReview: (ReviewType) => void
};

type State = {
  edit: ?number,
  page: number,
  pageSize: number,
  orderDir: ListOrderDirection,
  order: ListOrder,
  filters: Filters
}

class Controller extends React.PureComponent<Props, State> {
  static displayName = 'Controller';

  state = {
    edit: null,
    page: 0,
    pageSize: 10,
    order: 'date',
    orderDir: 'desc',
    filters: this.props.filters
  };

  componentDidMount() {
    const { data, uniqueId } = this.props;
    if (! has(uniqueId, data)) {
      this.loadPage(this.state);
    }
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (! equals(this.state, nextState) || !has(nextProps.uniqueId, nextProps.data)) {
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
    const { order, orderDir, pageSize, page, filters } = state;
    loadData(uniqueId, merge(filters, {
      productInfo: true,
      customerInfo: true,
      allLanguages: true,
      order: {
        direction: orderDir,
        field: order
      },
      page,
      pageSize
    }));
  }

  getList = (props: Props): ReviewListType => {
    const { data, uniqueId  } = props;
    const list = prop(uniqueId, data);
    const { order, orderDir, pageSize, page } = this.state;
    return list || {
      pageSize,
      page,
      order,
      orderDir,
      total: 0,
      pages: 0,
      reviews: []
    };
  };

  render() {
    const { data, uniqueId } = this.props;
    if (has(uniqueId, data)) {
      return this.renderList(data[uniqueId]);
    }
    return null;
  }

  renderList(list: ReviewListType) {
    const {
      languages, criteria, emptyLabel, title, shape, approveReview, deleteReview, undeleteReview,
      language, shapeSize, shopName, displayCriteria, deletePermReview
    } = this.props;
    const { edit, page, pageSize, order, orderDir, filters } = this.state;
    const { total, reviews } = list;
    const filtered = this.filter(reviews);
    const diff = reviews.length - filtered.length;
    const selectedReview = edit ? find(propEq('id', edit), reviews) : null;

    return (
      <div>
        <ReviewsTable
          title={title}
          shape={shape}
          data={filtered}
          total={total - diff}
          page={page}
          orderDir={orderDir}
          order={order}
          rowsPerPage={pageSize}
          onSetOrder={(order, orderDir) => this.setState({ order, orderDir })}
          onChangeRowsPerPage={pageSize => this.setState({ pageSize })}
          onChangePage={page => this.setState({ page })}
          onReviewClick={this.onReviewClick}
          onAuthorClick={this.onAuthorClick}
          approveReview={approveReview}
          deleteReview={deleteReview}
          undeleteReview={undeleteReview}
          deletePermReview={deletePermReview}
          emptyLabel={emptyLabel || 'Nothing found'}
          filters={filters}
          onChangeFilters={this.onChangeFilters}
        />
        <EditReviewDialog
          shopName={shopName}
          languages={languages}
          language={language}
          review={selectedReview}
          allowEmptyReviews={true}
          criteria={criteria}
          shape={shape}
          shapeSize={shapeSize}
          onSave={this.onSaveReview}
          displayCriteria={displayCriteria}
          onClose={() => this.setState({ edit: null })}
        />
      </div>
    );
  }

  onChangeFilters = (filters: Filters) => {
    this.setState({ filters });
  }

  filter = (reviews: Array<ReviewType>) => {
    return reject(this.hiddenReview, reviews);
  }

  onAuthorClick = (authorType: 'guest' | 'customer', id: number) => {
  }

  onSaveReview = (review: ReviewType) => {
    this.props.saveReview(review);
  }

  onReviewClick = (id: ?number) => {
    this.setState({ edit: id });
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
