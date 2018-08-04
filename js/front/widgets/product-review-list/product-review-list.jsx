// @flow
import React from 'react';
import type { ReviewListType, ReviewType } from 'common/types';
import type { SettingsType, VisitorType, EntitiesType } from 'front/types';
import List from '../review-list/review-list';

type Props = {
  hasReviewed: boolean,
  canReview: boolean,
  productId: number,
  entities: EntitiesType,
  reviewList: ReviewListType,
  visitor: VisitorType,
  settings: SettingsType,
  loading: boolean,
  loadPage: (number)=>void,
  onEdit: (ReviewType)=>void,
  onCreate: (number)=>void,
  onDelete: (ReviewType)=>void,
  onReport: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
};

class FrontAppReviewList extends React.PureComponent<Props> {
  static displayName = 'FrontAppReviewList';

  render() {
    const { loadPage, settings, entities, reviewList, loading, onEdit, onDelete, onReport, onVote } = this.props;
    const isEmpty = reviewList.total === 0;
    return isEmpty ? this.renderEmptyState() : (
      <div>
        <List
          reviewStyle='item'
          entities={entities}
          shopName={settings.shopName}
          dateFormat={settings.dateFormat}
          shape={settings.shape}
          shapeSize={settings.shapeSize.product}
          reviewList={reviewList}
          loading={loading}
          onDelete={onDelete}
          onEdit={onEdit}
          onReport={onReport}
          criteria={settings.criteria}
          displayCriteria={settings.preferences.displayCriteria}
          displayReply={true}
          onVote={onVote}
          allowPaging={true}
          loadPage={loadPage} />
        { this.renderWriteReview() }
      </div>
    );
  }

  renderWriteReview = () => {
    const { canReview, hasReviewed } = this.props;
    if (hasReviewed) {
      return;
    }
    if (canReview) {
      return this.renderCreateButton(__('Write your review!'));
    }
    if (this.showSignInButton()) {
      return (
        <div className="form-group">
          <a className="btn btn-primary" href={this.getLoginUrl()}>
            {__('Sign in to write a review')}
          </a>
        </div>
      );
    }
  }

  renderEmptyState = () => {
    const { canReview } = this.props;
    if (canReview) {
      return this.renderCreateButton(__('Be the first to write a review!'));
    }
    if (this.showSignInButton()) {
      return (
        <div className="form-group">
          <a className="btn btn-primary" href={this.getLoginUrl()}>
            {__('Sign in to write a review')}
          </a>
        </div>
      );
    }
    return (
      <div className="form-group">
        {__('No customer reviews for the moment.')}
      </div>
    );
  }

  renderCreateButton = (label: string) => {
    const { productId, onCreate } = this.props;
    return (
      <div className="form-group">
        <a className="btn btn-primary" onClick={e => onCreate(productId)}>
          { label }
        </a>
      </div>
    );
  }

  showSignInButton = () => {
    const { settings, visitor } = this.props;
    return visitor.type === 'guest' && settings.preferences.showSignInButton;
  }

  getLoginUrl = () => this.props.settings.loginUrl + encodeURIComponent(window.location.href);
}

export default FrontAppReviewList;
