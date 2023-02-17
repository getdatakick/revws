
// @flow
import type { ComponentType } from 'react';
import type { State } from 'front/reducer/index.js';
import DeleteReviewConfirm from 'common/components/confirm-delete/confirm-delete.jsx';
import { connect } from 'react-redux';
import { getReview } from 'front/selectors/delete-review.js';
import { closeDeleteReview, deleteReview } from 'front/actions/creators.js';

const mapStateToProps = (state: State) => ({
  deleteLabel: __('Delete review'),
  confirmation: __('Are you sure you want to delete this review?'),
  payload: getReview(state),
});

const actions = {
  onClose: closeDeleteReview,
  onConfirm: deleteReview
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{}> = connectRedux(DeleteReviewConfirm);

export default ConnectedComponent;
