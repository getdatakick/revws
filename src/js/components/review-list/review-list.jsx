// @flow
import React from 'react';
import type { ReviewType, ReviewListType, SettingsType } from 'types';
import { map } from 'ramda';
import ReviewListItem from 'components/review-list-item/review-list-item';

type Props = {
  settings: SettingsType,
  reviews: ReviewListType,
  onEdit: (ReviewType)=>void,
  onCreate: ()=>void,
  onDelete: (ReviewType)=>void,
  onReport: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void
};

class ReviewList extends React.PureComponent<Props> {
  static displayName = 'ReviewList';

  render() {
    const { settings, reviews } = this.props;
    const isEmpty = reviews.length == 0;
    const canCreate = settings.permissions.create;
    return isEmpty ? this.renderEmptyState(canCreate) : this.renderReviews(canCreate);
  }

  renderReviews = (canCreate: boolean) => {
    const { reviews } = this.props;
    const ret = map(this.renderReview, reviews);
    if (canCreate) {
      ret.push(
        <div key="write" className="form-group">
          <a className="btn btn-primary" onClick={this.props.onCreate}>
            {'Write your review!'}
          </a>
        </div>
      );
    }
    return ret;
  }

  renderReview = (review: ReviewType) => {
    const { settings, onReport, onVote, onEdit, onDelete } = this.props;
    return (
      <ReviewListItem
        settings={settings}
        key={review.id}
        onEdit={onEdit}
        onDelete={onDelete}
        onVote={onVote}
        onReport={onReport}
        review={review} />
    );
  }

  renderEmptyState = (canCreate: boolean) => {
    if (canCreate) {
      return (
        <div className="form-group">
          <a className="btn btn-primary" onClick={this.props.onCreate}>
            {'Be the first to write review!'}
          </a>
        </div>
      );
    }

    return (
      <div className="form-group">
        {'No customer reviews for the moment.'}
      </div>
    );
  }
}

export default ReviewList;
