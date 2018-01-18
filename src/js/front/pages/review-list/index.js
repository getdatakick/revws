
// @flow
import type { ComponentType } from 'react';
import type { SettingsType } from 'front/types';
import ReviewList from './review-list';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getReviews, isLoading } from 'front/selectors/review-list';
import { loadPage, triggerVoteReview, triggerReportReview, triggerEditReview, triggerCreateReview, triggerDeleteReview } from 'front/actions/creators';

const mapStateToProps = mapObject({
  reviews: getReviews,
  loading: isLoading,
});

const actions = {
  onEdit: triggerEditReview,
  onCreate: triggerCreateReview,
  onDelete: triggerDeleteReview,
  onVote: triggerVoteReview,
  onReport: triggerReportReview,
  loadPage
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{settings: SettingsType}> = connectRedux(ReviewList);

export default ConnectedComponent;
