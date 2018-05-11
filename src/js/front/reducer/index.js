// @flow

import type { ReviewListType } from 'common/types';
import type { SettingsType } from 'front/types';
import { combineReducers } from 'redux';
import createEditReview from './edit-review';
import createReviewList from './review-list';
import snackbar from './snackbar';
import deleteReview from './delete-review';
import createProductsToReview from './products-to-review';
import createGDPR from './gdpr';

const createReducer = (
  settings: SettingsType,
  reviews: ReviewListType,
  toReview: Array<number>
) => {
  const editReview = createEditReview(settings);
  const reviewList = createReviewList(reviews);
  const productsToReview = createProductsToReview(settings, toReview);
  const gdpr = createGDPR(settings);
  return combineReducers({
    gdpr,
    reviewList,
    snackbar,
    editReview,
    deleteReview,
    productsToReview
  });
};

export default createReducer;
