// @flow
import React from 'react';
import { map } from 'ramda';
import type { GradingShapeType, ReviewType, ReviewListType } from 'common/types';
import ReviewListItem from 'common/components/review-list-item/review-list-item';
import { CircularProgress } from 'material-ui/Progress';

type Props = {
  shopName: string,
  shape: GradingShapeType,
  shapeSize: number,
  reviewList: ReviewListType,
  loading: boolean,
  onEdit: (ReviewType)=>void,
  onDelete: (ReviewType)=>void,
  onReport: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void
};

class ProductReviewList extends React.PureComponent<Props> {
  static displayName = 'ProductReviewList';

  render() {
    const { loading, reviewList } = this.props;
    return (
      <div key="list" className="revws-review-list">
        { map(this.renderReview, reviewList.reviews) }
        { loading && [
          <div key="loading" className="revws-loading" />,
          <div key="loading-spinner" className="revws-loading-spinner">
            <CircularProgress size={100} />
          </div>
        ]}
      </div>
    );
  }

  renderReview = (review: ReviewType) => {
    const { shape, shapeSize, onReport, onVote, onEdit, onDelete, shopName } = this.props;
    return (
      <ReviewListItem
        key={review.id}
        shape={shape}
        shapeSize={shapeSize}
        shopName={shopName}
        onEdit={onEdit}
        onDelete={onDelete}
        onVote={onVote}
        onReport={onReport}
        review={review} />
    );
  }
}

export default ProductReviewList;
