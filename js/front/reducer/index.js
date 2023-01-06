// @flow

import type { SettingsType, ReviewsType, ListsType, VisitorType, EntitiesType } from 'front/types.js';
import { combineReducers } from 'redux';
import createEditReview from './edit-review.js';
import type { State as EditReviewState } from './edit-review.js';
import snackbar from './snackbar.js';
import type { State as SnackbarState } from './snackbar.js';
import deleteReview from './delete-review.js';
import type { State as DeleteReviewState } from './delete-review.js';
import createVisitorReviews from './visitor-reviews.js';
import type { State as VisitorsReviewsState } from './visitor-reviews.js';
import createEntities from './entities.js';
import type { State as EntitiesState } from './entities.js';
import createGDPR from './gdpr.js';
import type { State as GDPRState } from './gdpr.js';
import createLists from './lists.js';
import type { State as ListsState } from './lists.js';
import createReviews from './reviews.js';
import type { State as ReviewsState } from './reviews.js';

export type State = {
    entities: EntitiesState,
    reviews: ReviewsState,
    lists: ListsState,
    editReview: EditReviewState,
    visitorReviews: VisitorsReviewsState,
    gdpr: GDPRState,
    snackbar: SnackbarState,
    deleteReview: DeleteReviewState
};

const createReducer = (
  settings: SettingsType,
  visitor: VisitorType,
  reviews: ReviewsType,
  lists: ListsType,
  entities: EntitiesType
): any => combineReducers({
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
