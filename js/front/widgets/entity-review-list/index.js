
// @flow
import type { ComponentType } from 'react';
import type { EntitiesType, ListConditions, ReviewsType, SettingsType, VisitorType } from 'front/types';
import type { EntityType, ListOrder, ListOrderDirection, ReviewType } from 'common/types';
import type { State } from 'front/reducer';
import type { State as Lists } from 'front/reducer/lists';
import type { Props } from './entity-review-list';
import ReviewList from './entity-review-list';
import { connect } from 'react-redux';
import { getLists } from 'front/selectors/lists';
import { getReviews } from 'front/selectors/reviews';
import { getIsReviewed } from 'front/selectors/visitor-reviews';
import { getReviewList } from 'front/utils/list';
import { getEntities } from 'front/selectors/entities';
import { loadList, triggerVoteReview, triggerReportReview, triggerEditReview, triggerCreateReview, triggerDeleteReview } from 'front/actions/creators';

type PassedProps = {
  settings: SettingsType,
  visitor: VisitorType,
  listId: string,
  entityType: EntityType,
  entityId: number,
  allowPaging: boolean,
};

type OwnProps = {
  lists: Lists,
  entities: EntitiesType,
  reviews: ReviewsType,
  isReviewed: (EntityType, number) => bool
}

type Actions = {
  onEdit: (ReviewType)=>void,
  onCreate: (EntityType, number)=>void,
  onDelete: (ReviewType)=>void,
  onReport: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
  loadList: (string, ListConditions, number, number, ListOrder, ListOrderDirection)=>void
}

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
  const hasReviewed = isReviewed(entityType, entityId);
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
