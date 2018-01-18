// @flow
import type { Load, SettingsType, FullCriterion } from 'back/types';
import type { RoutingState } from 'back/routing';


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
  types: {
    [ string ]: Load
  }
}

export type SetDataAction = {
  type: 'SET_DATA',
  payload: any
}

export type ApproveReviewAction = {
  type: 'APPROVE_REVIEW',
  id: number
}

export type ReviewApprovedAction = {
  type: 'REVIEW_APPROVED',
  id: number
}

export type DeleteReviewAction = {
  type: 'DELETE_REVIEW',
  id: number
}

export type ReviewDeletedAction = {
  type: 'REVIEW_DELETED',
  id: number
}

export type UndeleteReviewAction = {
  type: 'UNDELETE_REVIEW',
  id: number
}

export type ReviewUndeletedAction = {
  type: 'REVIEW_UNDELETED',
  id: number
}

export type Action = (
  GoToAction |
  LoadDataAction |
  SetDataAction |
  SetSettingsAction |
  SetSnackbarAction |
  SetSizeAction |
  SaveCriterionAction |
  CriterionSavedAction |
  DeleteCriterionAction |
  CriterionDeletedAction |
  ApproveReviewAction |
  ReviewApprovedAction |
  DeleteReviewAction |
  ReviewDeletedAction |
  UndeleteReviewAction |
  ReviewUndeletedAction 
);
