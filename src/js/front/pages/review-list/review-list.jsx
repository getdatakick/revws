// @flow
import React from 'react';
import type { ReviewListType, ReviewType } from 'common/types';
import type { SettingsType } from 'front/types';
import ReviewList from 'common/components/review-list/review-list';

type Props = {
  reviews: ReviewListType,
  settings: SettingsType,
  onEdit: (ReviewType)=>void,
  onCreate: ()=>void,
  onDelete: (ReviewType)=>void,
  onReport: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
};

class FrontAppReviewList extends React.PureComponent<Props> {
  static displayName = 'FrontAppReviewList';

  render() {
    const { settings, ...rest } = this.props;
    return (
      <ReviewList
        canCreate={settings.permissions.create}
        shape={settings.shape}
        shapeSize={settings.shapeSize.product}
        {...rest}
      />
    );
  }
}

export default FrontAppReviewList;
