// @flow

import type { ReviewListType, ReviewType } from 'common/types';
import type {
  CloseEditReviewAction,
  SaveReviewAction,
  UpdateReviewDetailsAction,
  SaveReviewCompletedAction,
  SetSnackbarAction,
  DeleteReviewAction,
  CloseDeleteReviewAction,
  TriggerDeleteReviewAction,
  TriggerCreateReviewAction,
  TriggerEditReviewAction,
  SetReviewAction,
  TriggerVoteAction,
  TriggerReportReviewAction,
  ReviewRemovedAction,
  LoadPageAction,
  SetReviewsAction,
  AgreeGDPRAction
} from './index';
import Types from './types';

export const setSnackbar = (message: ?string): SetSnackbarAction => ({ type: Types.setSnackbar, message });

export const triggerCreateReview = (productId: number): TriggerCreateReviewAction => ({ type: Types.triggerCreateReview, productId });
export const triggerEditReview = (review: ReviewType): TriggerEditReviewAction => ({ type: Types.triggerEditReview, review });
export const triggerVoteReview = (review: ReviewType, direction: 'up' | 'down'): TriggerVoteAction => ({ type: Types.triggerVote, review, direction });
export const triggerReportReview = (review: ReviewType): TriggerReportReviewAction => ({ type: Types.triggerReportReview, review });
export const closeEditReview = (): CloseEditReviewAction => ({ type: Types.closeEditReview });
export const saveReview = (review: ReviewType): SaveReviewAction => ({ type: Types.saveReview, review });
export const saveReviewCompleted = (saved: boolean): SaveReviewCompletedAction => ({ type: Types.saveReviewCompleted, saved });
export const updateReviewDetails = (review: ReviewType): UpdateReviewDetailsAction => ({ type: Types.updateReviewDetails, review });
export const setReview = (review: ReviewType): SetReviewAction => ({ type: Types.setReview, review });

export const triggerDeleteReview = (review: ReviewType): TriggerDeleteReviewAction => ({ type: Types.triggerDeleteReview, review });
export const deleteReview = (review: ReviewType): DeleteReviewAction => ({ type: Types.deleteReview, review });
export const closeDeleteReview = (): CloseDeleteReviewAction => ({ type: Types.closeDeleteReview });
export const reviewRemoved = (review: ReviewType): ReviewRemovedAction => ({ type: Types.reviewRemoved, review });

export const loadPage = (entityType: 'product' | 'customer', entityId: number, page: number): LoadPageAction => ({ type: Types.loadPage, entityType, entityId, page });
export const setReviews = (reviews: ReviewListType): SetReviewsAction => ({ type: Types.setReviews, reviews });

export const agreeGDPR = (agreed: boolean): AgreeGDPRAction => ({ type: Types.agreeGDPR, agreed });
