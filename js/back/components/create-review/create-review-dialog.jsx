// @flow

import React from 'react';
import type { ReviewFormErrors, NameFormatType, ReviewType, CriteriaType, GradingShapeType, CustomerInfoType, LanguagesType } from 'common/types';
import { equals, keys } from 'ramda';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'common/components/dialog';
import SelectProduct from 'back/components/select-product';
import SelectCustomer from 'back/components/select-customer';
import EditReviewForm from 'back/components/edit-review/edit-review-form-controller';
import { validateReview, hasErrors } from 'common/utils/validation';
import { formatName } from 'common/utils/format';

type Props = {
  nameFormat: NameFormatType,
  allowEmptyReview: boolean,
  shape: GradingShapeType,
  shapeSize: number,
  language: number,
  languages: LanguagesType,
  criteria: CriteriaType,
  onSave: (ReviewType)=>void,
  onClose: ()=>void
}

type State = {
  productId: ?number,
  review: ?ReviewType,
}

class EditReviewDialog extends React.PureComponent<Props, State> {

  state = {
    review: null,
    productId: null,
  }

  render() {
    const { onClose, allowEmptyReview, criteria } = this.props;
    const { review } = this.state;
    const errors = review ? validateReview(allowEmptyReview, review) : null;
    const grades = review ? equals(keys(criteria), keys(review.grades)) : false;
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
    const { review, productId } = this.state;
    if (! productId) {
      return __('Select product');
    }
    if (! review) {
      return __('Select customer');
    }
    return __('Create review');
  }

  renderContent = (errors: ?ReviewFormErrors) => {
    const { shape, language, criteria, languages } = this.props;
    const { productId, review } = this.state;
    if (! productId) {
      return <SelectProduct onSelect={this.setProduct} />;
    }
    if (review && errors) {
      return (
        <EditReviewForm
          productId={review.productId}
          review={review}
          onUpdateReview={review => this.setState({review})}
          shape={shape}
          criteria={criteria}
          language={language}
          languages={languages}
          errors={errors}
        />
      );
    } else {
      return <SelectCustomer onSelect={this.setCustomer} />;
    }
  }

  setProduct = (productId: number) => {
    this.setState({ productId });
  }

  setCustomer = (customerInfo: CustomerInfoType) => {
    const productId = this.state.productId || 0;
    const review: ReviewType = {
      id: -1,
      language: this.props.language,
      productId,
      authorType: 'customer',
      authorId: customerInfo.id,
      customer: null,
      product: null,
      email: customerInfo.email,
      grades: {},
      images: [],
      reply: null,
      displayName: formatName(customerInfo.firstName, customerInfo.lastName, customerInfo.pseudonym, this.props.nameFormat),
      title: '',
      content: null,
      underReview: true,
      deleted: false,
      verifiedBuyer: true,
      date: new Date(),
      canVote: false,
      canReport: false,
      canDelete: true,
      canEdit: true
    };
    this.setState({ review });
  }



  onSave = () => {
    const { onSave, onClose } = this.props;
    const { review } = this.state;
    if (review) {
      onSave(review);
    }
    onClose();
  }
}

export default EditReviewDialog;
