
// @flow
import type { ComponentType } from 'react';
import type { SettingsType, VisitorType } from 'front/types';
import type { State } from 'front/reducer';
import EditReview from './edit-review-dialog/edit-review-dialog';
import { connect } from 'react-redux';
import { getStage, getReview } from 'front/selectors/edit-review';
import { hasAgreed } from 'front/selectors/gdpr';
import { closeEditReview, saveReview, updateReviewDetails, uploadImage, agreeGDPR } from 'front/actions/creators';
import { getEntities } from 'front/selectors/entities';

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
