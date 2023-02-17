// @flow
import type { LoadTypes, SettingsType, FullCriterion, FullCriteria, EmailPreferences } from 'back/types.js';
import type { ReviewType } from 'common/types.js';
import type { RoutingState } from 'back/routing/index.js';

export type ActivateAccountAction = {
  type: 'ACTIVATE_ACCOUNT',
  email: string,
  emailPreferences: EmailPreferences
}

export type SetReviewedAction = {
  type: 'SET_REVIEWED'
}

export type ActivateAccountFailedAction = {
  type: 'ACTIVATE_ACCOUNT_FAILED'
}

export type GoToAction = {
  type: 'GO_TO',
  routingState: RoutingState,
  updateHistory: boolean
};

export type SetSnackbarAction = {
  type: 'SET_SNACKBAR',
  message: ?string
}

export type SetSizeAction = {
  type: 'SET_SIZE',
  width: number,
  height: number
}

export type SetSettingsAction = {
  type: 'SET_SETTINGS',
  settings: SettingsType
}

export type SetCriteriaAction = {
  type: 'SET_CRITERIA',
  criteria: FullCriteria
}

export type SaveCriterionAction = {
  type: 'SAVE_CRITERION',
  criterion: FullCriterion
}

export type CriterionSavedAction = {
  type: 'CRITERION_SAVED',
  criterion: FullCriterion
}

export type DeleteCriterionAction = {
  type: 'DELETE_CRITERION',
  id: number
}

export type CriterionDeletedAction = {
  type: 'CRITERION_DELETED',
  id: number
}

export type LoadDataAction = {
  type: 'LOAD_DATA',
  types: LoadTypes,
}

export type SetDataAction = {
  type: 'SET_DATA',
  payload: any
}

export type ApproveReviewAction = {
  type: 'APPROVE_REVIEW',
  id: number
}

export type DeleteReviewAction = {
  type: 'DELETE_REVIEW',
  id: number,
  permanently: boolean
}

export type UndeleteReviewAction = {
  type: 'UNDELETE_REVIEW',
  id: number
}

export type SaveReviewAction = {
  type: 'SAVE_REVIEW',
  review: ReviewType
};

export type ReviewUpdatedAction = {
  type: 'REVIEW_UPDATED',
  review: ReviewType
}

export type ReviewCreatedAction = {
  type: 'REVIEW_CREATED',
  review: ReviewType
}

export type ReviewDeletedAction = {
  type: 'REVIEW_DELETED',
  id: number
}

export type MigrateDataAction = {
  type: 'MIGRATE_DATA',
  source: string,
  payload: any
}

export type UploadYotpoCsvAction = {
  type: 'UPLOAD_YOTPO_CSV',
  file: File
}

export type CheckModuleVersionAction = {
  type: 'CHECK_MODULE_VERSION'
}

export type CheckModuleVersionFailedAction = {
  type: 'CHECK_MODULE_VERSION_FAILED'
}

export type SetLatestVersionAction = {
  type: 'SET_LATEST_VERSION',
  version: string,
  ts: number,
  notes: string,
  paid: ?string
};

export type ExportReviewsAction = {
  type: 'EXPORT_REVIEWS'
};

export type RefreshDataAction = {
  type: 'REFRESH_DATA'
};

export type Action = (
  SetReviewedAction |
  ActivateAccountAction |
  ActivateAccountFailedAction |
  CheckModuleVersionAction |
  CheckModuleVersionFailedAction |
  SetLatestVersionAction |
  GoToAction |
  LoadDataAction |
  SetDataAction |
  SetSettingsAction |
  SetSnackbarAction |
  SetSizeAction |
  SetCriteriaAction |
  SaveCriterionAction |
  CriterionSavedAction |
  DeleteCriterionAction |
  CriterionDeletedAction |
  ApproveReviewAction |
  DeleteReviewAction |
  UndeleteReviewAction |
  SaveReviewAction |
  ReviewUpdatedAction |
  ReviewCreatedAction |
  ReviewDeletedAction |
  MigrateDataAction |
  UploadYotpoCsvAction |
  ExportReviewsAction |
  RefreshDataAction
);
