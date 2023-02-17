// @flow

import type { ComponentType } from 'react';
import type { EntitiesType, ListConditions, ReviewsType, SettingsType, VisitorType } from 'front/types.js';
import type { EntityType, ListOrder, ListOrderDirection, ReviewType } from 'common/types.js';
import type { State } from 'front/reducer/index.js';
import type { State as Lists } from 'front/reducer/lists';
import type { Props } from './entity-review-list.jsx';
import ReviewList from './entity-review-list.jsx';
import { connect } from 'react-redux';
import { getLists } from 'front/selectors/lists.js';
import { getReviews } from 'front/selectors/reviews.js';
import { getIsReviewed } from 'front/selectors/visitor-reviews.js';
import { getReviewList } from 'front/utils/list.js';
import { getEntities } from 'front/selectors/entities.js';
import { loadList, triggerVoteReview, triggerReportReview, triggerEditReview, triggerCreateReview, triggerDeleteReview } from 'front/actions/creators.js';

type PassedProps = {|
  settings: SettingsType,
  visitor: VisitorType,
  listId: string,
  entityType: EntityType,
  entityId: number,
  allowPaging: boolean,
  displayMicrodata: boolean,
|};

type OwnProps = {|
  lists: Lists,
  entities: EntitiesType,
  reviews: ReviewsType,
  isReviewed: (EntityType, number) => bool
|}

type Actions = {|
  onEdit: (ReviewType)=>void,
  onCreate: (EntityType, number)=>void,
  onDelete: (ReviewType)=>void,
  onReport: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
  loadList: (string, ListConditions, number, number, ListOrder, ListOrderDirection)=>void
|}

const mapStateToProps = (state: State): OwnProps => ({
  lists: getLists(state),
  entities: getEntities(state),
  reviews: getReviews(state),
  isReviewed: getIsReviewed(state),
});

const actions = {
  onEdit: triggerEditReview,
  onCreate: triggerCreateReview,
  onDelete: triggerDeleteReview,
  onVote: triggerVoteReview,
  onReport: triggerReportReview,
  loadList: loadList,
};

const merge = (props: OwnProps, actions: Actions, passed: PassedProps): Props => {
  const { isReviewed, lists, reviews, entities  } = props;
  const { settings, visitor, listId, entityType, entityId } = passed;
  const { loadList, ...restActions } = actions;
  const list = lists[listId];
  const loading = list.loading;
  const reviewList = getReviewList(list, reviews);
  const forbidden = visitor.type === 'guest' && !settings.preferences.allowGuestReviews;
  const hasReviewed = settings.preferences.allowMultipleReviews ? false : isReviewed(entityType, entityId);
  const canReview = !forbidden && !hasReviewed;
  const loadPage = (page: number) => {
    return loadList(listId, list.conditions, page, list.pageSize, list.order, list.orderDir);
  };
  return {
    hasReviewed,
    canReview,
    reviewList,
    loading,
    loadPage,
    entities,
    ...restActions,
    ...passed
  };
};

const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<PassedProps> = connectRedux(ReviewList);

export default ConnectedComponent;
