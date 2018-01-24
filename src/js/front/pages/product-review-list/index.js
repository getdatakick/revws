
// @flow
import type { ComponentType } from 'react';
import type { SettingsType } from 'front/types';
import { contains } from 'ramda';
import ReviewList from './product-review-list';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getReviews, isLoading } from 'front/selectors/review-list';
import { productsToReview } from 'front/selectors/products-to-review';
import { loadPage, triggerVoteReview, triggerReportReview, triggerEditReview, triggerCreateReview, triggerDeleteReview } from 'front/actions/creators';

const mapStateToProps = mapObject({
  reviewList: getReviews,
  productsToReview,
  loading: isLoading,
});

const actions = {
  onEdit: triggerEditReview,
  onCreate: triggerCreateReview,
  onDelete: triggerDeleteReview,
  onVote: triggerVoteReview,
  onReport: triggerReportReview,
  loadPage: (entityId, page) => loadPage('product', entityId, page)
};

const merge = (props, actions, passed) => {
  const { productsToReview, ...own } = props;
  const productId = passed.productId;
  const canCreate = contains(productId, productsToReview);
  return {
    canCreate,
    ...own,
    ...actions,
    ...passed
  };
};

const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<{
  settings: SettingsType,
  productId: number
}> = connectRedux(ReviewList);

export default ConnectedComponent;
