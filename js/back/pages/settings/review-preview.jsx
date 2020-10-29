// @flow
import React from 'react';
import type { Node } from 'react';
import { map, indexBy, prop } from 'ramda';
import type { DisplayCriteriaType, GradingShapeType, ReviewType, ShapeColorsType, CriteriaType } from 'common/types';
import styles from './style.less';
import Bootstrap from 'common/components/bootstrap/bootstrap';
import ReviewListItem from 'common/components/review-list-item/review-list-item';

type Props = {
  shopName: string,
  colors: ShapeColorsType,
  shape: GradingShapeType,
  dateFormat: string,
  displayCriteria: DisplayCriteriaType,
  size: number,
  canVote: boolean,
  canReport: boolean
}

class ReviewPreview extends React.PureComponent<Props> {
  static displayName: ?string = 'ReviewPreview';

  render(): Node {
    const { shape, size, colors, canVote, canReport, shopName, displayCriteria, dateFormat } = this.props;
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
      entityType: 'product',
      entityId: 1,
      entity: null,
      customer: null,
      displayName: 'John Doe',
      email: '',
      title: 'Amazing product!',
      content: "I have bough this product and it rocks!\nIf only the shipping was cheaper...",
      grades,
      images: [],
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
          dateFormat={dateFormat}
          review={review}
          criteria={criteria}
          displayCriteria={displayCriteria}
          displayMicrodata={false}
          colors={colors} />
      </Bootstrap>
    );
  }
}

export default ReviewPreview;
