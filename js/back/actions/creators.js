// @flow

import type { Load, SettingsType, FullCriterion, FullCriteria } from 'back/types';
import type { ReviewType } from 'common/types';
import type { RoutingState } from 'back/routing';
import type {
  CheckModuleVersionAction,
  CheckModuleVersionFailedAction,
  SetLatestVersionAction,
  GoToAction,
  SetSizeAction,
  SetSnackbarAction,
  SetSettingsAction,
  SetCriteriaAction,
  SaveCriterionAction,
  CriterionSavedAction,
  DeleteCriterionAction,
  CriterionDeletedAction,
  LoadDataAction,
  SetDataAction,
  ApproveReviewAction,
  DeleteReviewAction,
  UndeleteReviewAction,
  SaveReviewAction,
  ReviewUpdatedAction,
  ReviewCreatedAction,
  ReviewDeletedAction,
  MigrateDataAction,
  UploadYotpoCsvAction,
  ExportReviewsAction,
  RefreshDataAction
} from './index';
import Types from './types';

export const checkModuleVersion = (): CheckModuleVersionAction => ({ type: Types.checkModuleVersion });
export const checkModuleVersionFailed = (): CheckModuleVersionFailedAction => ({ type: Types.checkModuleVersionFailed });
export const setLatestVersion = (version: string, ts: number, notes: string, paid: ?string): SetLatestVersionAction => ({ type: Types.setLatestVersion, version, ts, notes, paid });
export const goTo = (routingState: RoutingState, updateHistory?:boolean = true): GoToAction => ({ type: Types.goTo, routingState, updateHistory });
export const setSnackbar = (message: ?string): SetSnackbarAction => ({ type: Types.setSnackbar, message });
export const setSize = (width: number, height: number): SetSizeAction => ({ type: Types.setSize, width, height });
export const setSettings = (settings: SettingsType): SetSettingsAction => ({ type: Types.setSettings, settings });

export const setCriteria = (criteria: FullCriteria): SetCriteriaAction => ({ type: Types.setCriteria, criteria });
export const saveCriterion = (criterion: FullCriterion): SaveCriterionAction => ({ type: Types.saveCriterion, criterion });
export const criterionSaved = (criterion: FullCriterion): CriterionSavedAction => ({ type: Types.criterionSaved, criterion });
export const deleteCriterion = (id: number): DeleteCriterionAction => ({ type: Types.deleteCriterion, id });
export const criterionDeleted = (id: number): CriterionDeletedAction => ({ type: Types.criterionDeleted, id });

export const loadData = (types: { [ string ]: Load }): LoadDataAction => ({ type: Types.loadData, types });
export const setData = (payload: any): SetDataAction => ({ type: Types.setData, payload });

export const approveReview = (id: number): ApproveReviewAction => ({ type: Types.approveReview, id });
export const deleteReview = (id: number): DeleteReviewAction => ({ type: Types.deleteReview, id, permanently: false });
export const deletePermReview = (id: number): DeleteReviewAction => ({ type: Types.deleteReview, id, permanently: true });
export const undeleteReview = (id: number): UndeleteReviewAction => ({ type: Types.undeleteReview, id });

export const saveReview = (review: ReviewType): SaveReviewAction => ({ type: Types.saveReview, review });
export const reviewUpdated = (review: ReviewType): ReviewUpdatedAction => ({ type: Types.reviewUpdated, review });
export const reviewCreated = (review: ReviewType): ReviewCreatedAction => ({ type: Types.reviewCreated, review });
export const reviewDeleted = (id: number): ReviewDeletedAction => ({ type: Types.reviewDeleted, id });

export const migrateData = (source: string, payload: any): MigrateDataAction => ({ type: Types.migrateData, source, payload });
export const uploadYotpoCsv = (file: File): UploadYotpoCsvAction => ({ type: Types.uploadYotpoCsv, file });

export const exportReviews = (): ExportReviewsAction => ({ type: Types.exportReviews });
export const refreshData = (): RefreshDataAction => ({ type: Types.refreshData });
