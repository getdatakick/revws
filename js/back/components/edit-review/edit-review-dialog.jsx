// @flow

import type {Node, Element} from "React";import React from 'react';
import type { DisplayCriteriaType, ReviewType, ReviewFormErrors, CriteriaType, GradingShapeType, LanguagesType } from 'common/types';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'common/components/dialog';
import EditReviewForm from './edit-review-form';
import ViewReviewForm from './view-review-form';
import { validateReview, hasErrors } from 'common/utils/validation';
import { assoc, equals } from 'ramda';
import styles from './edit-review-form.less';

type Props = {
  shopName: string,
  allowEmptyTitle: boolean,
  allowEmptyReviews: boolean,
  review: ?ReviewType,
  language: number,
  languages: LanguagesType,
  criteria: CriteriaType,
  dateFormat: string,
  displayCriteria: DisplayCriteriaType,
  usedCriteria: ?Array<number>,
  shape: GradingShapeType,
  shapeSize: number,
  onSave: (ReviewType)=>void,
  onClose: ()=>void
}

type State = {
  review: ?ReviewType,
  mode: 'view' | 'edit'
}

class EditReviewDialog extends React.PureComponent<Props, State> {

  state: State = {
    review: this.props.review,
    mode: 'view'
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (! equals(this.props.review, nextProps.review)) {
      this.setState({
        review: nextProps.review,
        mode: 'view'
      });
    }
  }

  render(): Node {
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

  renderDialog: ((review: ReviewType) => Element<"div">) = (review: ReviewType) => {
    const { allowEmptyTitle, allowEmptyReviews } = this.props;
    const errors = validateReview(allowEmptyTitle, allowEmptyReviews, review);
    const viewMode = this.state.mode === 'view';
    const withErrors = hasErrors(errors);
    const label = viewMode ? __('Review details') : __('Edit review');
    return (
      <div className={styles.root}>
        <DialogTitle>{ label }</DialogTitle>
        <DialogContent>
          { viewMode ? this.renderViewMode(review) : this.renderEditMode(review, errors)}
        </DialogContent>
        <DialogActions>
          { viewMode ? this.viewModeButtons(review) : this.editModeButtons(review, withErrors) }
        </DialogActions>
      </div>
    );
  }

  viewModeButtons: ((review: ReviewType) => Array<any | Node | Element<"div">>) = (review: ReviewType) => {
    const { onClose } = this.props;
    const actions = [];
    if (review.deleted) {
      actions.push(
        <Button key="undelete" onClick={this.undeleteReview}>
          {__('Undelete')}
        </Button>
      );
    } else {
      if (review.underReview) {
        actions.push(
          <Button key="approve" color='accent' onClick={this.approveReview}>
            {__('Approve')}
          </Button>
        );
      }
      actions.push(
        <Button key="delete" onClick={this.deleteReview}>
          {review.underReview ? 'Reject' : 'Delete'}
        </Button>
      );
    }
    actions.push(
      <div key="divider" className={styles.divider} />
    );
    actions.push(
      <Button key="edit" onClick={e => this.setState({ mode: 'edit' })}>
        {__('Edit')}
      </Button>
    );
    actions.push(
      <Button key="close" color="primary" onClick={onClose}>
        {__('Close')}
      </Button>
    );
    return actions;
  }

  editModeButtons: ((review: ReviewType, withErrors: boolean) => Array<Node>) = (review: ReviewType, withErrors: boolean) => {
    const { onClose, onSave } = this.props;
    const same = equals(this.props.review, review);
    return [
      <Button key="close" onClick={onClose}>
        {__('Close')}
      </Button>,
      <Button key="save" color='accent' disabled={withErrors || same} onClick={e => onSave(review)}>
        {__('Save')}
      </Button>
    ];
  }

  renderEditMode: ((review: ReviewType, errors: ReviewFormErrors) => Node) = (review: ReviewType, errors: ReviewFormErrors) => {
    const { criteria, usedCriteria, language, shape, languages } = this.props;
    return (
      <EditReviewForm
        languages={languages}
        review={review}
        onUpdateReview={this.onUpdateReview}
        shape={shape}
        language={language}
        criteria={criteria}
        usedCriteria={usedCriteria}
        errors={errors} />
    );
  }

  renderViewMode: ((review: ReviewType) => Node) = (review: ReviewType) => {
    const { onSave, criteria, language, shape, shapeSize, shopName, displayCriteria, dateFormat } = this.props;
    return (
      <ViewReviewForm
        onUpdateReview={review => {
          this.onUpdateReview(review);
          onSave(review);
        }}
        shopName={shopName}
        review={review}
        shape={shape}
        shapeSize={shapeSize}
        dateFormat={dateFormat}
        language={language}
        displayCriteria={displayCriteria}
        criteria={criteria} />
    );
  }

  onUpdateReview: ((review: ReviewType) => void) = (review: ReviewType) => {
    this.setState({ review });
  }

  deleteReview: (() => void) = () => {
    const { review, onSave, onClose } = this.props;
    onSave(assoc('deleted', true, review));
    onClose();
  }

  undeleteReview: (() => void) = () => {
    const { review, onSave, onClose } = this.props;
    onSave(assoc('deleted', false, review));
    onClose();
  }

  approveReview: (() => void) = () => {
    const { review, onSave, onClose } = this.props;
    onSave(assoc('underReview', false, review));
    onClose();
  }
}

export default EditReviewDialog;
