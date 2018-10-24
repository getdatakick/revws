
// @flow
import type { ComponentType } from 'react';
import type { SettingsType, CustomListWidgetType } from 'front/types';
import ReviewList from './review-list';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getLists } from 'front/selectors/lists';
import { getReviews } from 'front/selectors/reviews';
import { getReviewList } from 'front/utils/list';
import { getEntities } from 'front/selectors/entities';
import { loadList, triggerVoteReview, triggerReportReview, triggerEditReview, triggerDeleteReview } from 'front/actions/creators';

type PassedProps = {
  settings: SettingsType,
  widget: CustomListWidgetType,
  listId: string
};

const mapStateToProps = mapObject({
  lists: getLists,
  entities: getEntities,
  reviews: getReviews
});

const actions = {
  onEdit: triggerEditReview,
  onDelete: triggerDeleteReview,
  onVote: triggerVoteReview,
  onReport: triggerReportReview,
  loadList: loadList,
};

const merge = (props, actions, passed: PassedProps) => {
  const { lists, reviews, entities  } = props;
  const { widget, settings, listId } = passed;
  const { loadList, ...restActions } = actions;
  const list = lists[listId];
  const loading = list.loading;
  const reviewList = getReviewList(list, reviews);
  const loadPage = (page: number) => {
    return loadList(listId, list.conditions, page, list.pageSize, list.order, list.orderDir);
  };

  return {
    reviewList,
    loading,
    loadPage,
    entities,
    shopName: settings.shopName,
    displayReply: widget.displayReply,
    shape: settings.shape,
    shapeSize: settings.shapeSize.product,
    dateFormat: settings.dateFormat,
    criteria: settings.criteria,
    displayCriteria: widget.displayCriteria,
    reviewStyle: widget.reviewStyle,
    allowPaging: widget.allowPaging,
    ...restActions,
    ...passed
  };
};

const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<PassedProps> = connectRedux(ReviewList);

export default ConnectedComponent;
