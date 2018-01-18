// @flow

import type { Load, SettingsType, FullCriterion } from 'back/types';
import type { ReviewType } from 'common/types';
import type { RoutingState } from 'back/routing';
import type {
  GoToAction,
  SetSizeAction,
  SetSnackbarAction,
  SetSettingsAction,
  SaveCriterionAction,
  CriterionSavedAction,
  DeleteCriterionAction,
  CriterionDeletedAction,
  LoadDataAction,
  SetDataAction,
  ApproveReviewAction,
  ReviewApprovedAction,
  DeleteReviewAction,
  ReviewDeletedAction,
  UndeleteReviewAction,
  ReviewUndeletedAction,
  SaveReviewAction,
  ReviewSavedAction
} from './index';
import Types from './types';

export const goTo = (routingState: RoutingState, updateHistory?:boolean = true): GoToAction => ({ type: Types.goTo, routingState, updateHistory });
export const setSnackbar = (message: ?string): SetSnackbarAction => ({ type: Types.setSnackbar, message });
export const setSize = (width: number, height: number): SetSizeAction => ({ type: Types.setSize, width, height });
export const setSettings = (settings: SettingsType): SetSettingsAction => ({ type: Types.setSettings, settings });
export const saveCriterion = (criterion: FullCriterion): SaveCriterionAction => ({ type: Types.saveCriterion, criterion });
export const criterionSaved = (criterion: FullCriterion): CriterionSavedAction => ({ type: Types.criterionSaved, criterion });
export const deleteCriterion = (id: number): DeleteCriterionAction => ({ type: Types.deleteCriterion, id });
export const criterionDeleted = (id: number): CriterionDeletedAction => ({ type: Types.criterionDeleted, id });

export const loadData = (types: { [ string ]: Load }): LoadDataAction => ({ type: Types.loadData, types });
export const setData = (payload: any): SetDataAction => ({ type: Types.setData, payload });

export const approveReview = (id: number): ApproveReviewAction => ({ type: Types.approveReview, id });
export const reviewApproved = (id: number): ReviewApprovedAction => ({ type: Types.reviewApproved, id });
export const deleteReview = (id: number): DeleteReviewAction => ({ type: Types.deleteReview, id });
export const reviewDeleted = (id: number): ReviewDeletedAction => ({ type: Types.reviewDeleted, id });
export const undeleteReview = (id: number): UndeleteReviewAction => ({ type: Types.undeleteReview, id });
export const reviewUndeleted = (id: number): ReviewUndeletedAction => ({ type: Types.reviewUndeleted, id });

export const saveReview = (review: ReviewType): SaveReviewAction => ({ type: Types.saveReview, review });
export const reviewSaved = (review: ReviewType): ReviewSavedAction => ({ type: Types.reviewSaved, review });
