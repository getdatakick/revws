
// @flow
import type { ComponentType } from 'react';
import type { SettingsType, VisitorType } from 'front/types';
import { contains } from 'ramda';
import ReviewList from './product-review-list';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getLists } from 'front/selectors/lists';
import { getReviews } from 'front/selectors/reviews';
import { getReviewedProducts } from 'front/selectors/visitor-reviews';
import { getReviewList } from 'front/utils/list';
import { loadList, triggerVoteReview, triggerReportReview, triggerEditReview, triggerCreateReview, triggerDeleteReview } from 'front/actions/creators';

type PassedProps = {
  settings: SettingsType,
  visitor: VisitorType,
  listId: string,
  productId: number
};

const mapStateToProps = mapObject({
  lists: getLists,
  reviews: getReviews,
  reviewedProducts: getReviewedProducts
});

const actions = {
  onEdit: triggerEditReview,
  onCreate: triggerCreateReview,
  onDelete: triggerDeleteReview,
  onVote: triggerVoteReview,
  onReport: triggerReportReview,
  loadList: loadList,
};

const merge = (props, actions, passed: PassedProps) => {
  const { reviewedProducts, lists, reviews  } = props;
  const { settings, visitor, listId, productId } = passed;
  const { loadList, ...restActions } = actions;
  const list = lists[listId];
  const loading = list.loading;
  const reviewList = getReviewList(list, reviews);
  const forbidden = visitor.type === 'guest' && !settings.preferences.allowGuestReviews;
  const hasReviewed = contains(productId, reviewedProducts);
  const canReview = !forbidden && !hasReviewed;
  const loadPage = (page: number) => {
    const conditions = { product: productId };
    return loadList(listId, conditions, page, list.pageSize, list.order, list.orderDir);
  };
  return {
    hasReviewed,
    canReview,
    reviewList,
    loading,
    loadPage,
    ...restActions,
    ...passed
  };
};

const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<PassedProps> = connectRedux(ReviewList);

export default ConnectedComponent;
