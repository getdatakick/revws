
// @flow
import type { ComponentType } from 'react';
import type { SettingsType } from 'types';
import EditReview from 'components/edit-review-dialog/edit-review-dialog';
import { connect } from 'react-redux';
import { mapObject } from 'utils/redux';
import { getStage, getReview } from 'front/selectors/edit-review';
import { closeEditReview, saveReview, updateReviewDetails } from 'front/actions/creators';

const mapStateToProps = mapObject({
  review: getReview,
  stage: getStage
});

const actions = {
  onClose: closeEditReview,
  onSave: saveReview,
  onUpdateReview: updateReviewDetails,
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{ settings: SettingsType }> = connectRedux(EditReview);

export default ConnectedComponent;
