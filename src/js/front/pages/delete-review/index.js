
// @flow
import type { ComponentType } from 'react';
import DeleteReviewConfirm from 'common/components/delete-review-confirm/delete-review-confirm';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getReviewId } from 'front/selectors/delete-review';
import { closeDeleteReview, deleteReview } from 'front/actions/creators';

const mapStateToProps = mapObject({
  reviewId: getReviewId,
});

const actions = {
  onClose: closeDeleteReview,
  onConfirm: deleteReview
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{}> = connectRedux(DeleteReviewConfirm);

export default ConnectedComponent;
