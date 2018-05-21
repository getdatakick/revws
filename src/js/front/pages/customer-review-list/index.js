
// @flow
import type { ComponentType } from 'react';
import type { SettingsType } from 'front/types';
import ReviewList from './customer-review-list';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
//import { getReviews, isLoading } from 'front/selectors/review-list';
import { loadPage, triggerEditReview, triggerCreateReview, triggerDeleteReview } from 'front/actions/creators';
import { getProductsToReview } from 'front/selectors/visitor-reviews';
import { getEntities } from 'front/selectors/entities';

const mapStateToProps = mapObject({
//  reviewList: getReviews,
//  loading: isLoading,
  productsToReview: getProductsToReview,
  entities: getEntities
});

const actions = {
  onEdit: triggerEditReview,
  onCreate: triggerCreateReview,
  onDelete: triggerDeleteReview,
  loadPage: (entityId, page) => loadPage('customer', entityId, page)
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{
  settings: SettingsType,
  customerId: number
}> = connectRedux(ReviewList);

export default ConnectedComponent;
