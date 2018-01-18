// @flow
import React from 'react';
import { map } from 'ramda';
import type { GradingShapeType, ReviewType, ReviewListType } from 'common/types';
import ReviewListItem from 'common/components/review-list-item/review-list-item';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import IconButton from 'material-ui/IconButton';
import { CircularProgress } from 'material-ui/Progress';

type Props = {
  shape: GradingShapeType,
  shapeSize: number,
  reviews: ReviewListType,
  canCreate: boolean,
  loading: boolean,
  loadPage: (number)=>void,
  onEdit: (ReviewType)=>void,
  onCreate: ()=>void,
  onDelete: (ReviewType)=>void,
  onReport: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void
};

class ReviewList extends React.PureComponent<Props> {
  static displayName = 'ReviewList';

  render() {
    const { reviews, canCreate } = this.props;
    const isEmpty = reviews.total == 0;
    return isEmpty ? this.renderEmptyState(canCreate) : this.renderReviews(canCreate);
  }

  renderReviews = (canCreate: boolean) => {
    const { loading, loadPage } = this.props;
    const { page, pages, reviews } = this.props.reviews;

    const reviewList = map(this.renderReview, reviews);
    if (loading) {
      reviewList.push(<div key="loading" className="revws-loading" />);
      reviewList.push(
        <div key="loading-spinner" className="revws-loading-spinner">
          <CircularProgress size={100} />
        </div>
      );
    }

    const ret = [
      <div key="list" className="revws-review-list">
        { reviewList }
      </div>
    ];

    if (pages > 1) {
      ret.push(
        <div key="paging" className="revws-paging">
          <IconButton
            onClick={() => loadPage(page - 1)}
            disabled={loading || page === 0}>
            <KeyboardArrowLeft />
          </IconButton>
          <IconButton
            onClick={() => loadPage(page + 1)}
            disabled={loading || page == pages - 1}>
            <KeyboardArrowRight />
          </IconButton>
        </div>
      );
    }
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
    const { shape, shapeSize, onReport, onVote, onEdit, onDelete } = this.props;
    return (
      <ReviewListItem
        key={review.id}
        shape={shape}
        shapeSize={shapeSize}
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
