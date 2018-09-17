// @flow

export default {
  // snackbar
  setSnackbar: 'SET_SNACKBAR',

  // create / edit review
  setReview: 'SET_REVIEW',
  triggerCreateReview: 'TRIGGER_CREATE_REVIEW',
  triggerEditReview: 'TRIGGER_EDIT_REVIEW',
  closeEditReview: 'CLOSE_EDIT_REVIEW',
  saveReview: 'SAVE_REVIEW',
  saveReviewCompleted: 'SAVE_REVIEW_COMPLETED',
  updateReviewDetails: 'UPDATE_REVIEW_DETAILS',

  triggerDeleteReview: 'TRIGGER_DELETE_REVIEW',
  closeDeleteReview: 'CLOSE_DELETE_REVIEW',
  deleteReview: 'DELETE_REVIEW',
  reviewRemoved: 'REVIEW_REMOVED',

  triggerReportReview: 'TRIGGER_REPORT_REVIEW',
  triggerVote: 'TRIGGER_VOTE',

  loadList: 'LOAD_LIST',
  loadListFailed: 'LOAD_LIST_FAILED',
  setList: 'SET_LIST',
  setReviews: 'SET_REVIEWS',
  mergeEntities: 'MERGE_ENTITIES',

  agreeGDPR: 'AGREE_GDPR',

  uploadImage: 'UPLOAD_IMAGE',
  uploadImageFailed: 'UPLOAD_IMAGE_FAILED',
  setImage: 'SET_IMAGE'
};
