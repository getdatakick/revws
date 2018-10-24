// @flow
import React from 'react';
import type { DisplayCriteriaType, GradingShapeType, ReviewType, ShapeColorsType, CriteriaType, EntityInfoType } from 'common/types';
import ReviewListItem from 'common/components/review-list-item/review-list-item';

type Props = {
  shopName: string,
  shape: GradingShapeType,
  entity: EntityInfoType,
  colors?: ShapeColorsType,
  shapeSize: number,
  dateFormat: string,
  criteria: CriteriaType,
  displayCriteria: DisplayCriteriaType,
  review: ReviewType,
  onEdit: (ReviewType)=>void,
  onSaveReply?: (?string)=>void,
  onDelete: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
  onReport: (ReviewType)=>void
};

class ReviewListItemWithEntity extends React.PureComponent<Props> {
  static displayName = 'ReviewListItemWithEntity';

  static defaultProps = {};

  render() {
    const { entity, shopName, shape, colors, shapeSize, criteria, displayCriteria, review, onEdit, onDelete, onVote, onReport, dateFormat } = this.props;
    return (
      <div className="revws-review-with-product">
        <div>
          <a href={entity.url}>
            <img src={entity.image} alt={entity.name} />
          </a>
        </div>
        <div className='revws-review-wrapper'>
          <h2>
            <a href={entity.url}>{entity.name}</a>
          </h2>
          <ReviewListItem
            shopName={shopName}
            shape={shape}
            colors={colors}
            shapeSize={shapeSize}
            dateFormat={dateFormat}
            criteria={criteria}
            displayCriteria={displayCriteria}
            review={review}
            onEdit={onEdit}
            onDelete={onDelete}
            onVote={onVote}
            onReport={onReport}
          />
        </div>
      </div>
    );
  }
}

export default ReviewListItemWithEntity;
