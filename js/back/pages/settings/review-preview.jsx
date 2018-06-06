// @flow
import React from 'react';
import { map, indexBy, prop } from 'ramda';
import type { DisplayCriteriaType, GradingShapeType, ReviewType, ShapeColorsType, CriteriaType } from 'common/types';
import styles from './style.less';
import Bootstrap from 'common/components/bootstrap/bootstrap';
import ReviewListItem from 'common/components/review-list-item/review-list-item';

type Props = {
  shopName: string,
  colors: ShapeColorsType,
  shape: GradingShapeType,
  displayCriteria: DisplayCriteriaType,
  size: number,
  canVote: boolean,
  canReport: boolean
}

class ReviewPreview extends React.PureComponent<Props> {
  static displayName = 'ReviewPreview';

  render() {
    const { shape, size, colors, canVote, canReport, shopName, displayCriteria } = this.props;
    const criteria: CriteriaType = indexBy(prop('id'), [
      { id: 1, label: __('Quality'), value: 5},
      { id: 2, label: __('Shipping'), value: 3}
    ]);
    const grades = map(prop('value'), criteria);
    const review: ReviewType = {
      id: 1,
      authorType: 'customer',
      language: 1,
      authorId: 1,
      productId: 1,
      product: null,
      customer: null,
      displayName: 'John Doe',
      email: '',
      title: 'Amazing product!',
      content: "I have bough this product and it rocks!\nIf only the shipping was cheaper...",
      grades,
      reply: null,
      date: new Date(),
      underReview: false,
      deleted: false,
      verifiedBuyer: false,
      canVote: canVote,
      canReport: canReport,
      canDelete: false,
      canEdit: false
    };

    return (
      <Bootstrap key={size} className={styles.preview}>
        <ReviewListItem
          shopName={shopName}
          shape={shape}
          shapeSize={size}
          review={review}
          criteria={criteria}
          displayCriteria={displayCriteria}
          colors={colors} />
      </Bootstrap>
    );
  }
}

export default ReviewPreview;
