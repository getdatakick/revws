// @flow

import type { SettingsType, ReviewListType } from 'types';
import { combineReducers } from 'redux';
import createEditReview from './edit-review';
import createReviewList from './review-list';
import snackbar from './snackbar';
import deleteReview from './delete-review';

const createReducer = (settings: SettingsType, reviews: ReviewListType) => {
  const editReview = createEditReview(settings);
  const reviewList = createReviewList(reviews);
  return combineReducers({
    reviewList,
    snackbar,
    editReview,
    deleteReview
  });
};

export default createReducer;
