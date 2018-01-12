// @flow

import type { ReviewType } from 'common/types';
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
  TriggerReportReviewAction
} from './index';
import Types from './types';

export const setSnackbar = (message: ?string): SetSnackbarAction => ({ type: Types.setSnackbar, message });

export const triggerCreateReview = (): TriggerCreateReviewAction => ({ type: Types.triggerCreateReview });
export const triggerEditReview = (review: ReviewType): TriggerEditReviewAction => ({ type: Types.triggerEditReview, review });
export const triggerVoteReview = (review: ReviewType, direction: 'up' | 'down'): TriggerVoteAction => ({ type: Types.triggerVote, review, direction });
export const triggerReportReview = (review: ReviewType): TriggerReportReviewAction => ({ type: Types.triggerReportReview, review });
export const closeEditReview = (): CloseEditReviewAction => ({ type: Types.closeEditReview });
export const saveReview = (review: ReviewType): SaveReviewAction => ({ type: Types.saveReview, review });
export const saveReviewCompleted = (saved: boolean): SaveReviewCompletedAction => ({ type: Types.saveReviewCompleted, saved });
export const updateReviewDetails = (review: ReviewType): UpdateReviewDetailsAction => ({ type: Types.updateReviewDetails, review });
export const setReview = (review: ReviewType): SetReviewAction => ({ type: Types.setReview, review });

export const triggerDeleteReview = (review: ReviewType): TriggerDeleteReviewAction => ({ type: Types.triggerDeleteReview, review });
export const deleteReview = (id: number): DeleteReviewAction => ({ type: Types.deleteReview, id });
export const closeDeleteReview = (): CloseDeleteReviewAction => ({ type: Types.closeDeleteReview });
