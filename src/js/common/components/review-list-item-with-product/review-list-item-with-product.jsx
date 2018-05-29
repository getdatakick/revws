// @flow
import React from 'react';
import type { DisplayCriteriaType, GradingShapeType, ReviewType, ShapeColorsType, CriteriaType, ProductInfoType } from 'common/types';
import ReviewListItem from 'common/components/review-list-item/review-list-item';

type Props = {
  shopName: string,
  shape: GradingShapeType,
  product: ProductInfoType,
  colors?: ShapeColorsType,
  shapeSize: number,
  criteria: CriteriaType,
  displayCriteria: DisplayCriteriaType,
  review: ReviewType,
  onEdit: (ReviewType)=>void,
  onSaveReply?: (?string)=>void,
  onDelete: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
  onReport: (ReviewType)=>void
};

class ReviewListItemWithProduct extends React.PureComponent<Props> {
  static displayName = 'ReviewListItemWithProduct';

  static defaultProps = {};

  render() {
    const { product, shopName, shape, colors, shapeSize, criteria, displayCriteria, review, onEdit, onDelete, onVote, onReport } = this.props;
    return (
      <div className="revws-review-with-product">
        <div>
          <a href={product.url}>
            <img src={product.image} alt={product.name} />
          </a>
        </div>
        <div className='revws-review-wrapper'>
          <h2>
            <a href={product.url}>{product.name}</a>
          </h2>
          <ReviewListItem
            shopName={shopName}
            shape={shape}
            colors={colors}
            shapeSize={shapeSize}
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

export default ReviewListItemWithProduct;
