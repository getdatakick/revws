
// @flow
import type { ComponentType } from 'react';
import type { SettingsType } from 'front/types';
import EditReview from './edit-review-dialog/edit-review-dialog';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getStage, getReview } from 'front/selectors/edit-review';
import { hasAgreed } from 'front/selectors/gdpr';
import { closeEditReview, saveReview, updateReviewDetails, agreeGDPR } from 'front/actions/creators';

const mapStateToProps = mapObject({
  review: getReview,
  agreed: hasAgreed,
  stage: getStage
});

const actions = {
  onClose: closeEditReview,
  onSave: saveReview,
  onAgree: agreeGDPR,
  onUpdateReview: updateReviewDetails,
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{ settings: SettingsType }> = connectRedux(EditReview);

export default ConnectedComponent;
