
// @flow
import type { ComponentType } from 'react';
import type { SettingsType } from 'front/types';
import { contains } from 'ramda';
import ReviewList from './product-review-list';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getReviews, isLoading } from 'front/selectors/review-list';
import { getReviewedProducts } from 'front/selectors/visitor-reviews';
import { loadPage, triggerVoteReview, triggerReportReview, triggerEditReview, triggerCreateReview, triggerDeleteReview } from 'front/actions/creators';

type PassedProps = {
  settings: SettingsType,
  productId: number
};

const mapStateToProps = mapObject({
  reviewList: getReviews,
  loading: isLoading,
  reviewedProducts: getReviewedProducts
});

const actions = {
  onEdit: triggerEditReview,
  onCreate: triggerCreateReview,
  onDelete: triggerDeleteReview,
  onVote: triggerVoteReview,
  onReport: triggerReportReview,
  loadPage: (entityId, page) => loadPage('product', entityId, page)
};

const merge = (props, actions, passed: PassedProps) => {
  const { reviewedProducts, ...own } = props;
  const { settings, productId } = passed;
  const forbidden = settings.visitor.type === 'guest' && !settings.preferences.allowGuestReviews;
  const canReview = !forbidden && !contains(productId, reviewedProducts);
  return {
    canReview,
    ...own,
    ...actions,
    ...passed
  };
};

const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<PassedProps> = connectRedux(ReviewList);

export default ConnectedComponent;
