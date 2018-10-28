// @flow

import React from 'react';
import type { EntityType, ReviewFormErrors, ReviewType, CriteriaType, GradingShapeType, CustomerInfoType, LanguagesType } from 'common/types';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'common/components/dialog';
import SelectEntity from 'back/components/select-entity';
import SelectCustomer from 'back/components/select-customer';
import EditReviewForm from 'back/components/edit-review/edit-review-form';
import { validateReview, hasErrors } from 'common/utils/validation';

type Props = {
  entityType: ?EntityType,
  entityId: ?number,
  review: ?ReviewType,
  allowEmptyReview: boolean,
  shape: GradingShapeType,
  shapeSize: number,
  language: number,
  languages: LanguagesType,
  criteria: CriteriaType,
  usedCriteria: ?Array<number>,
  onSetEntity: (EntityType, number)=>void,
  onSetCustomer: (customerInfo: CustomerInfoType)=>void,
  onUpdateReview: (ReviewType)=>void,
  onSave: (ReviewType)=>void,
  onClose: ()=>void
}

class CreateReviewDialog extends React.PureComponent<Props> {
  render() {
    const { review, onClose, allowEmptyReview, usedCriteria } = this.props;
    const errors = review ? validateReview(allowEmptyReview, review) : null;
    const grades = (review && usedCriteria ) ? criteriaEntered(usedCriteria,review.grades) : false;
    const invalid = !review || !grades || hasErrors(errors);
    return (
      <Dialog
        fullWidth={true}
        maxWidth='md'
        open={true}
        onClose={onClose}>
        <DialogTitle>{ this.getLabel() }</DialogTitle>
        <DialogContent>
          { this.renderContent(errors) }
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            {__('Close')}
          </Button>,
          <Button color='accent' disabled={invalid} onClick={this.onSave}>
            {__('Create review')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  getLabel = () => {
    const { review, entityId } = this.props;
    if (! entityId) {
      return __('Create new review for');
    }
    if (! review) {
      return __('Select customer');
    }
    return __('Create review');
  }

  renderContent = (errors: ?ReviewFormErrors) => {
    const { onUpdateReview, entityId, review, shape, language, criteria, usedCriteria, languages, onSetEntity, onSetCustomer } = this.props;
    if (! entityId) {
      return (
        <SelectEntity
          onSelect={onSetEntity} />
      );
    }
    if (review && errors) {
      return (
        <EditReviewForm
          review={review}
          onUpdateReview={onUpdateReview}
          shape={shape}
          criteria={criteria}
          usedCriteria={usedCriteria}
          language={language}
          languages={languages}
          errors={errors}
        />
      );
    } else {
      return <SelectCustomer onSelect={onSetCustomer} />;
    }
  }


  onSave = () => {
    const { onSave, onClose, review } = this.props;
    if (review) {
      onSave(review);
    }
    onClose();
  }
}

const criteriaEntered = (used, grades) => {
  for (var i = 0; i < used.length; i++) {
    const crit = used[i];
    if (! grades[crit]) {
      return false;
    }
  }
  return true;
};

export default CreateReviewDialog;
