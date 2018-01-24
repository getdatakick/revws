// @flow
import React from 'react';
import type { ReviewListType, ReviewType } from 'common/types';
import type { SettingsType } from 'front/types';
import List from './list';
import Paging from 'common/components/review-list-paging/review-list-paging';

type Props = {
  customerId: number,
  reviewList: ReviewListType,
  settings: SettingsType,
  loading: boolean,
  loadPage: (number, number)=>void,
  onEdit: (ReviewType)=>void,
  onCreate: (number)=>void,
  onDelete: (ReviewType)=>void,
};

class FrontAppCustomerReviewList extends React.PureComponent<Props> {
  static displayName = 'FrontAppCustomerReviewList';

  render() {
    const { settings, reviewList, loading, onEdit, onDelete } = this.props;
    const isEmpty = reviewList.total === 0;
    return isEmpty ? this.renderEmptyState() : (
      <div>
        <List
          settings={settings}
          reviewList={reviewList}
          loading={loading}
          onDelete={onDelete}
          onEdit={onEdit} />
        { this.renderPaging() }
      </div>
    );
  }

  renderPaging = () => {
    const { customerId, loading, loadPage } = this.props;
    const { page, pages } = this.props.reviewList;
    if (pages > 1) {
      return (
        <Paging
          key='paging'
          page={page}
          pages={pages}
          loading={loading}
          loadPage={page => loadPage(customerId, page)} />
      );
    }
    return null;
  }

  renderEmptyState = () => {
    return (
      <div className="form-group">
        {"You haven't written any review yet"}
      </div>
    );
  }
}

export default FrontAppCustomerReviewList;
