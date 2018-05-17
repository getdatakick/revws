// @flow

import type { ReviewListType } from 'common/types';
import type { SettingsType } from 'front/types';
import { combineReducers } from 'redux';
import createEditReview from './edit-review';
import createReviewList from './review-list';
import snackbar from './snackbar';
import deleteReview from './delete-review';
import createVisitorReviews from './visitor-reviews';
import createGDPR from './gdpr';

const createReducer = (
  settings: SettingsType,
  reviews: ReviewListType,
  toReview: Array<number>,
  reviewed: Array<number>
) => {
  const editReview = createEditReview(settings);
  const reviewList = createReviewList(reviews);
  const visitorReviews = createVisitorReviews(settings, toReview, reviewed);
  const gdpr = createGDPR(settings);
  return combineReducers({
    gdpr,
    reviewList,
    snackbar,
    editReview,
    deleteReview,
    visitorReviews
  });
};

export default createReducer;
