// @flow

import React from 'react';
import type { ReviewType, ReviewFormErrors, CriteriaType, GradingShapeType } from 'common/types';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import EditReviewForm from '../edit-review-form/edit-review-form';
import { validateReview, hasErrors } from 'common/utils/validation';
import { equals } from 'ramda';

type Props = {
  allowEmptyReviews: boolean,
  review: ?ReviewType,
  language: number,
  criteria: CriteriaType,
  shape: GradingShapeType,
  onSave: (ReviewType)=>void,
  onClose: ()=>void
}

type State = {
  review: ?ReviewType
}

class EditReviewDialog extends React.PureComponent<Props, State> {

  state = {
    review: this.props.review
  }

  componentWillReceiveProps(nextProps: Props) {
    if (! equals(this.props.review, nextProps.review)) {
      this.setState({
        review: nextProps.review
      });
    }
  }

  render() {
    const { onClose } = this.props;
    const review = this.state.review;
    return (
      <Dialog
        fullWidth={true}
        maxWidth='md'
        open={!! review}
        onClose={onClose} >
        { review ? this.renderDialog(review) : '' }
      </Dialog>
    );
  }

  renderDialog = (review: ReviewType) => {
    const { onClose, onSave, allowEmptyReviews } = this.props;
    const errors = validateReview(allowEmptyReviews, review);
    const withErrors = hasErrors(errors);

    const buttons = [
      <Button key="close" onClick={onClose}>
        {'Close'}
      </Button>,
      <Button key="save" color='accent' disabled={withErrors} onClick={e => onSave(review)}>
        {'Save'}
      </Button>
    ];
    return (
      <div>
        <DialogTitle>Edit review</DialogTitle>
        <DialogContent>
          { this.renderContent(review, errors)}
        </DialogContent>
        <DialogActions>
          { buttons }
        </DialogActions>
      </div>
    );
  }

  renderContent = (review: ReviewType, errors: ReviewFormErrors) => {
    const { criteria, language, shape } = this.props;
    return (
      <EditReviewForm
        review={review}
        onUpdateReview={this.onUpdateReview}
        shape={shape}
        language={language}
        criteria={criteria}
        errors={errors} />
    );
  }

  onUpdateReview = (review: ReviewType) => {
    this.setState({
      review
    });
  }

}

export default EditReviewDialog;
