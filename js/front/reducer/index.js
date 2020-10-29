// @flow

import type { SettingsType, ReviewsType, ListsType, VisitorType, EntitiesType } from 'front/types';
import { combineReducers } from 'redux';
import createEditReview from './edit-review';
import type { State as EditReviewState } from './edit-review';
import snackbar from './snackbar';
import type { State as SnackbarState } from './snackbar';
import deleteReview from './delete-review';
import type { State as DeleteReviewState } from './delete-review';
import createVisitorReviews from './visitor-reviews';
import type { State as VisitorsReviewsState } from './visitor-reviews';
import createEntities from './entities';
import type { State as EntitiesState } from './entities';
import createGDPR from './gdpr';
import type { State as GDPRState } from './gdpr';
import createLists from './lists';
import type { State as ListsState } from './lists';
import createReviews from './reviews';
import type { State as ReviewsState } from './reviews';

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
