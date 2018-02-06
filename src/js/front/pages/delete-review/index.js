
// @flow
import type { ComponentType } from 'react';
import DeleteReviewConfirm from 'common/components/confirm-delete/confirm-delete';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getReview } from 'front/selectors/delete-review';
import { closeDeleteReview, deleteReview } from 'front/actions/creators';

const mapStateToProps = mapObject({
  deleteLabel: () => __('Delete review'),
  confirmation: () => __('Are you sure you want to delete this review?'),
  payload: getReview,
});

const actions = {
  onClose: closeDeleteReview,
  onConfirm: deleteReview
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{}> = connectRedux(DeleteReviewConfirm);

export default ConnectedComponent;
