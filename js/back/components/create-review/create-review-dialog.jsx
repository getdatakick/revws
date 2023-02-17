// @flow

import type {Node} from 'react';
import React from 'react';
import type {
  EntityType,
  ReviewFormErrors,
  ReviewType,
  CriteriaType,
  GradingShapeType,
  CustomerInfoType,
  LanguagesType,
  GradingType
} from 'common/types.js';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'common/components/dialog/index.jsx';
import SelectEntityType from 'back/components/select-entity-type/select-entity-type.jsx';
import SelectEntity from 'back/components/select-entity/index.jsx';
import SelectCustomer from 'back/components/select-customer/index.jsx';
import EditReviewForm from 'back/components/edit-review/edit-review-form.jsx';
import { validateReview, hasErrors } from 'common/utils/validation.js';

type Props = {
  entityTypes: { [ EntityType ]: string },
  entityType: ?EntityType,
  entityId: ?number,
  review: ?ReviewType,
  allowEmptyTitle: boolean,
  allowEmptyReview: boolean,
  shape: GradingShapeType,
  shapeSize: number,
  language: number,
  languages: LanguagesType,
  criteria: CriteriaType,
  usedCriteria: ?Array<number>,
  onSetEntityType: (EntityType)=>void,
  onSetEntity: (number)=>void,
  onSetCustomer: (customerInfo: CustomerInfoType)=>void,
  onUpdateReview: (ReviewType)=>void,
  onSave: (ReviewType)=>void,
  onClose: ()=>void
}

class CreateReviewDialog extends React.PureComponent<Props> {
  render(): Node {
    const { review, onClose, allowEmptyReview, allowEmptyTitle, usedCriteria } = this.props;
    const errors = review ? validateReview(allowEmptyTitle, allowEmptyReview, review) : null;
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

  getLabel: (() => string) = () => {
    const { review, entityId, entityType, entityTypes } = this.props;
    if (! entityType) {
      return __('Select review type');
    }
    if (! entityId) {
      const name = entityTypes[entityType] || entityType;
      return __('Select %s', name.toLowerCase());
    }
    if (! review) {
      return __('Select customer');
    }
    return __('Create review');
  }

  renderContent: ((errors: ?ReviewFormErrors) => Node) = (errors: ?ReviewFormErrors) => {
    const { onUpdateReview, entityTypes, entityType, entityId, review, shape, language, criteria, usedCriteria, languages, onSetEntity, onSetEntityType, onSetCustomer } = this.props;
    if (!entityType) {
      return (
        <SelectEntityType
          entityTypes={entityTypes}
          onSelect={onSetEntityType} />
      );
    }
    if (entityType && !entityId) {
      return (
        <SelectEntity
          entityName={entityTypes[entityType] || entityType}
          entityType={entityType}
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


  onSave: (() => void) = () => {
    const { onSave, onClose, review } = this.props;
    if (review) {
      onSave(review);
    }
    onClose();
  }
}

const criteriaEntered = (used:Array<number>, grades: GradingType) => {
  for (let i = 0; i < used.length; i++) {
    const crit = used[i];
    if (! grades[crit]) {
      return false;
    }
  }
  return true;
};

export default CreateReviewDialog;
