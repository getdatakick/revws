// @flow
import type { EntityType, ReviewType, ListOrder, ListOrderDirection } from 'common/types';
import type { ListConditions, ListType, EntitiesType } from 'front/types';

export type SetReviewAction = {
  type: 'SET_REVIEW',
  review: ReviewType
}

export type ReviewRemovedAction = {
  type: 'REVIEW_REMOVED',
  review: ReviewType
}

export type TriggerCreateReviewAction = {
  type: 'TRIGGER_CREATE_REVIEW',
  entityType: EntityType,
  entityId: number
};

export type CloseEditReviewAction = {
  type: 'CLOSE_EDIT_REVIEW'
};

export type UpdateReviewDetailsAction = {
  type: 'UPDATE_REVIEW_DETAILS',
  review: ReviewType
};

export type SaveReviewAction = {
  type: 'SAVE_REVIEW',
  review: ReviewType
};

export type SaveReviewCompletedAction = {
  type: 'SAVE_REVIEW_COMPLETED',
  saved: boolean
}

export type TriggerEditReviewAction = {
  type: 'TRIGGER_EDIT_REVIEW',
  review: ReviewType
};

export type TriggerDeleteReviewAction = {
  type: 'TRIGGER_DELETE_REVIEW',
  review: ReviewType
};

export type DeleteReviewAction = {
  type: 'DELETE_REVIEW',
  review: ReviewType
};

export type CloseDeleteReviewAction = {
  type: 'CLOSE_DELETE_REVIEW'
};

export type TriggerReportReviewAction = {
  type: 'TRIGGER_REPORT_REVIEW',
  review: ReviewType
};

export type TriggerVoteAction = {
  type: 'TRIGGER_VOTE',
  review: ReviewType,
  direction: 'up' | 'down'
};

export type SetSnackbarAction = {
  type: 'SET_SNACKBAR',
  message: ?string
}

export type LoadListAction = {
  type: 'LOAD_LIST',
  listId: string,
  conditions: ListConditions,
  pageSize: number,
  page: number,
  order: ListOrder,
  orderDir: ListOrderDirection
}

export type LoadListFailedAction = {
  type: 'LOAD_LIST_FAILED',
  listId: string
};

export type SetListAction = {
  type: 'SET_LIST',
  list: ListType
};

export type SetReviewsAction = {
  type: 'SET_REVIEWS',
  reviews: Array<ReviewType>
}

export type AgreeGDPRAction = {
  type: 'AGREE_GDPR',
  agreed: boolean
}


export type MergeEntitiesAction = {
  type: 'MERGE_ENTITIES',
  entities: EntitiesType
}

export type UploadImageAction = {
  type: 'UPLOAD_IMAGE',
  id: number,
  file: File
}

export type UploadImageFailedAction = {
  type: 'UPLOAD_IMAGE_FAILED',
  id: number
}

export type SetImageAction = {
  type: 'SET_IMAGE',
  id: number,
  image: string
}

export type Action = (
  SetReviewAction |
  TriggerCreateReviewAction |
  CloseEditReviewAction |
  UpdateReviewDetailsAction |
  SaveReviewAction |
  SaveReviewCompletedAction |
  TriggerEditReviewAction |
  TriggerDeleteReviewAction |
  DeleteReviewAction |
  ReviewRemovedAction |
  CloseDeleteReviewAction |
  TriggerReportReviewAction |
  TriggerVoteAction |
  SetSnackbarAction |
  LoadListAction |
  LoadListFailedAction |
  SetListAction |
  SetReviewsAction |
  AgreeGDPRAction |
  MergeEntitiesAction |
  UploadImageAction |
  UploadImageFailedAction |
  SetImageAction
);
