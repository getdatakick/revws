// @flow
import React from 'react';
import type { ReviewListType, ReviewType } from 'common/types';
import type { SettingsType } from 'front/types';
import { values } from 'ramda';
import ReviewList from 'common/components/review-list/review-list';

type Props = {
  reviews: ReviewListType,
  settings: SettingsType,
  loading: boolean,
  loadPage: (number, number)=>void,
  onEdit: (ReviewType)=>void,
  onCreate: ()=>void,
  onDelete: (ReviewType)=>void,
  onReport: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
};

class FrontAppReviewList extends React.PureComponent<Props> {
  static displayName = 'FrontAppReviewList';

  render() {
    const { settings, loadPage, ...rest } = this.props;
    return (
      <ReviewList
        canCreate={this.canCreate()}
        shape={settings.shape}
        shapeSize={settings.shapeSize.product}
        loadPage={page => loadPage(settings.product.id, page)}
        {...rest}
      />
    );
  }

  canCreate = () => {
    const settings = this.props.settings;
    if (! settings.permissions.create) {
      return false;
    }
    const hasCriteria = values(settings.criteria).length > 0;
    if (hasCriteria) {
      return true;
    }
    return settings.preferences.allowReviewWithoutCriteria;
  }
}

export default FrontAppReviewList;
