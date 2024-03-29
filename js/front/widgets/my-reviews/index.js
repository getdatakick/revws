
// @flow
import type { ComponentType } from 'react';
import type {ListType, SettingsType} from 'front/types.js';
import type { State } from 'front/reducer/index.js';
import ReviewList from './my-reviews.jsx';
import { connect } from 'react-redux';
import { getLists } from 'front/selectors/lists.js';
import { getReviews } from 'front/selectors/reviews.js';
import { getReviewList } from 'front/utils/list.js';
import { loadList, triggerEditReview, triggerCreateReview, triggerDeleteReview } from 'front/actions/creators.js';
import { getProductsToReview } from 'front/selectors/visitor-reviews.js';
import { getEntities } from 'front/selectors/entities.js';

type PassedProps = {
  settings: SettingsType,
  listId: string,
  customerId: number
};

type OwnProps = {
  lists: Array<ListType>,

};

const mapStateToProps = (state: State) => ({
  lists: getLists(state),
  reviews: getReviews(state),
  productsToReview: getProductsToReview(state),
  entities: getEntities(state)
});

const actions = {
  onEdit: triggerEditReview,
  onCreate: triggerCreateReview,
  onDelete: triggerDeleteReview,
  loadList: loadList,
};

const merge = (props: any, actions: any, passed: PassedProps) => {
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
