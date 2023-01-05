// @flow
import type {Element} from 'react';
import React from 'react';
import type { EntityType, ReviewListType, ReviewType } from 'common/types';
import type { SettingsType, VisitorType, EntitiesType } from 'front/types';
import List from '../review-list/review-list';

export type Props = {
  hasReviewed: boolean,
  canReview: boolean,
  entityType: EntityType,
  entityId: number,
  entities: EntitiesType,
  reviewList: ReviewListType,
  visitor: VisitorType,
  settings: SettingsType,
  loading: boolean,
  loadPage: (number)=>void,
  allowPaging: boolean,
  displayMicrodata: boolean,
  onEdit: (ReviewType)=>void,
  onCreate: (EntityType, number)=>void,
  onDelete: (ReviewType)=>void,
  onReport: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
};

class EntityReviewList extends React.PureComponent<Props> {
  static displayName: ?string = 'EntityReviewList';

  render(): Element<"div"> {
    const { allowPaging, loadPage, settings, entities, reviewList, loading, onEdit, onDelete, onReport, onVote, displayMicrodata } = this.props;
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
          displayMicrodata={displayMicrodata}
          displayReply={true}
          onVote={onVote}
          allowPaging={allowPaging}
          loadPage={loadPage} />
        { this.renderWriteReview() }
      </div>
    );
  }

  renderWriteReview: (() => void | Element<"div">) = () => {
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
          <a className="btn btn-primary" href={this.getLoginUrl()} rel="nofollow">
            {__('Sign in to write a review')}
          </a>
        </div>
      );
    }
  }

  renderEmptyState: (() => Element<"div">) = () => {
    const { canReview } = this.props;
    if (canReview) {
      return this.renderCreateButton(__('Be the first to write a review!'));
    }
    if (this.showSignInButton()) {
      return (
        <div className="form-group">
          <a className="btn btn-primary" href={this.getLoginUrl()} rel="nofollow">
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

  renderCreateButton: ((label: string) => Element<"div">) = (label: string) => {
    const { entityType, entityId, onCreate } = this.props;
    return (
      <div className="form-group">
        <a className="btn btn-primary" onClick={e => onCreate(entityType, entityId)}>
          { label }
        </a>
      </div>
    );
  }

  showSignInButton: (() => boolean) = () => {
    const { settings, visitor } = this.props;
    return visitor.type === 'guest' && settings.preferences.showSignInButton;
  }

  getLoginUrl: (() => string) = () => this.props.settings.loginUrl + encodeURIComponent(window.location.href);
}

export default EntityReviewList;
