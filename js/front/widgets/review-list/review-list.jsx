// @flow
import React from 'react';
import { map } from 'ramda';
import type { EntitiesType, ReviewDisplayStyle } from 'front/types';
import type { DisplayCriteriaType, GradingShapeType, ReviewType, ReviewListType, CriteriaType } from 'common/types';
import ReviewListItem from 'common/components/review-list-item/review-list-item';
import ReviewListItemWithEntity from 'common/components/review-list-item-with-entity/review-list-item-with-entity';
import { getEntity } from 'front/utils/entities';
import { CircularProgress } from 'material-ui/Progress';
import Paging from 'common/components/review-list-paging/review-list-paging';

type Props = {
  reviewStyle: ReviewDisplayStyle,
  entities: EntitiesType,
  shopName: string,
  shape: GradingShapeType,
  shapeSize: number,
  dateFormat: string,
  reviewList: ReviewListType,
  criteria: CriteriaType,
  displayCriteria: DisplayCriteriaType,
  displayReply: boolean,
  loading: boolean,
  allowPaging: boolean,
  loadPage: (number)=>void,
  onEdit: (ReviewType)=>void,
  onDelete: (ReviewType)=>void,
  onReport: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void
};

class ReviewList extends React.PureComponent<Props> {
  static displayName = 'ReviewList';

  render() {
    const { reviewStyle, loading, reviewList } = this.props;
    const func = reviewStyle === 'item' ? this.renderReview : this.renderReviewWithEntity;
    return [
      <div key="list" className="revws-review-list">
        { map(func, reviewList.reviews) }
        { loading && [
          <div key="loading" className="revws-loading" />,
          <div key="loading-spinner" className="revws-loading-spinner">
            <CircularProgress size={100} />
          </div>
        ]}
        { this.renderPaging() }
      </div>
    ];
  }

  renderReview = (review: ReviewType) => {
    const { displayReply, shape, shapeSize, onReport, onVote, onEdit, onDelete, shopName, displayCriteria, criteria, dateFormat } = this.props;
    return (
      <ReviewListItem
        key={review.id}
        dateFormat={dateFormat}
        shape={shape}
        shapeSize={shapeSize}
        shopName={shopName}
        onEdit={onEdit}
        onDelete={onDelete}
        onVote={onVote}
        onReport={onReport}
        criteria={criteria}
        displayCriteria={displayCriteria}
        displayReply={displayReply}
        review={review} />
    );
  }

  renderReviewWithEntity = (review: ReviewType) => {
    const { entities, shape, shapeSize, onReport, onVote, onEdit, onDelete, shopName, displayCriteria, criteria, dateFormat } = this.props;
    const entity = getEntity(entities, review.entityType, review.entityId);
    return (
      <ReviewListItemWithEntity
        entity={entity}
        key={review.id}
        shape={shape}
        shapeSize={shapeSize}
        dateFormat={dateFormat}
        shopName={shopName}
        onEdit={onEdit}
        onDelete={onDelete}
        onVote={onVote}
        onReport={onReport}
        criteria={criteria}
        displayCriteria={displayCriteria}
        review={review} />
    );
  }


  renderPaging = () => {
    const { allowPaging, loading, loadPage } = this.props;
    const { page, pages } = this.props.reviewList;
    if (allowPaging && pages > 1) {
      return (
        <Paging
          key='paging'
          page={page}
          pages={pages}
          loading={loading}
          loadPage={loadPage} />
      );
    }
    return null;
  }
}

export default ReviewList;
