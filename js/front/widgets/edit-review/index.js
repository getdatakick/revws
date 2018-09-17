
// @flow
import type { ComponentType } from 'react';
import type { SettingsType, VisitorType } from 'front/types';
import EditReview from './edit-review-dialog/edit-review-dialog';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getStage, getReview } from 'front/selectors/edit-review';
import { hasAgreed } from 'front/selectors/gdpr';
import { closeEditReview, saveReview, updateReviewDetails, uploadImage, agreeGDPR } from 'front/actions/creators';
import { getEntities } from 'front/selectors/entities';

const mapStateToProps = mapObject({
  review: getReview,
  agreed: hasAgreed,
  stage: getStage,
  entities: getEntities
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
