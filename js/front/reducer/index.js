// @flow

import type { SettingsType, ReviewsType, ListsType, VisitorType, EntitiesType } from 'front/types';
import { combineReducers } from 'redux';
import createEditReview from './edit-review';
import snackbar from './snackbar';
import deleteReview from './delete-review';
import createVisitorReviews from './visitor-reviews';
import createEntities from './entities';
import createGDPR from './gdpr';
import createLists from './lists';
import createReviews from './reviews';

const createReducer = (
  settings: SettingsType,
  visitor: VisitorType,
  reviews: ReviewsType,
  lists: ListsType,
  entities: EntitiesType
) => combineReducers({
  entities: createEntities(entities),
  reviews: createReviews(reviews),
  lists: createLists(lists),
  editReview: createEditReview(visitor),
  visitorReviews: createVisitorReviews(visitor),
  gdpr: createGDPR(settings),
  snackbar,
  deleteReview,
});

export default createReducer;
