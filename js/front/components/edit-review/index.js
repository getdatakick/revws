
// @flow
import type { ComponentType } from 'react';
import type { SettingsType, VisitorType } from 'front/types.js';
import type { State } from 'front/reducer/index.js';
import EditReview from './edit-review-dialog/edit-review-dialog.jsx';
import { connect } from 'react-redux';
import { getStage, getReview } from 'front/selectors/edit-review.js';
import { hasAgreed } from 'front/selectors/gdpr.js';
import { closeEditReview, saveReview, updateReviewDetails, uploadImage, agreeGDPR } from 'front/actions/creators.js';
import { getEntities } from 'front/selectors/entities.js';

const mapStateToProps = (state: State) => ({
  review: getReview(state),
  agreed: hasAgreed(state),
  stage: getStage(state),
  entities: getEntities(state)
});

const actions = {
  onClose: closeEditReview,
  onSave: saveReview,
  onAgree: agreeGDPR,
  onUpdateReview: updateReviewDetails,
  onUploadFile: uploadImage,
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{
  settings: SettingsType ,
  visitor: VisitorType
}> = connectRedux(EditReview);

export default ConnectedComponent;
