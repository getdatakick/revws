
// @flow
import type { ComponentType } from 'react';
import type { SettingsType } from 'front/types';
import ReviewList from './my-reviews';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getLists } from 'front/selectors/lists';
import { getReviews } from 'front/selectors/reviews';
import { getReviewList } from 'front/utils/list';
import { loadList, triggerEditReview, triggerCreateReview, triggerDeleteReview } from 'front/actions/creators';
import { getProductsToReview } from 'front/selectors/visitor-reviews';
import { getEntities } from 'front/selectors/entities';

type PassedProps = {
  settings: SettingsType,
  listId: string,
  customerId: number
};

const mapStateToProps = mapObject({
  lists: getLists,
  reviews: getReviews,
  productsToReview: getProductsToReview,
  entities: getEntities
});

const actions = {
  onEdit: triggerEditReview,
  onCreate: triggerCreateReview,
  onDelete: triggerDeleteReview,
  loadList: loadList,
};

const merge = (props, actions, passed: PassedProps) => {
  const { lists, reviews, ...restProps  } = props;
  const { listId } = passed;
  const { loadList, ...restActions } = actions;
  const list = lists[listId];
  const loading = list.loading;
  const reviewList = getReviewList(list, reviews);
  const loadPage = (page: number) => {
    return loadList(listId, list.conditions, page, list.pageSize, list.order, list.orderDir);
  };
  return {
    canReview: false,
    reviewList,
    loading,
    loadPage,
    ...restProps,
    ...restActions,
    ...passed
  };
};

const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<PassedProps> = connectRedux(ReviewList);

export default ConnectedComponent;
