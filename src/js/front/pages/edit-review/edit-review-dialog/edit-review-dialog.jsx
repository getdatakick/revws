// @flow

import React from 'react';
import type { ComponentType } from 'react';
import type { EditStage, CriterionType, ReviewType, ReviewFormErrors, ProductInfoType } from 'common/types';
import type { SettingsType } from 'front/types';
import Grading from 'common/components/grading/grading';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle, withMobileDialog } from 'material-ui/Dialog';
import EditReviewForm from '../edit-review-form/edit-review-form';
import Grid from 'material-ui/Grid';
import Check from 'material-ui-icons/Check';
import ErrorOutline from 'material-ui-icons/ErrorOutline';
import { CircularProgress } from 'material-ui/Progress';
import { fixUrl } from 'common/utils/url';
import { validateReview, hasErrors } from 'common/utils/validation';
import { find, assoc } from 'ramda';
import { getProduct } from 'front/settings';
import styles from './edit-review-dialog.less';

type Grades = {
  [ number ]: number
}

type InputProps = {
  stage: EditStage,
  settings: SettingsType,
  review: ?ReviewType,
  needConsent: boolean,
  agreed: boolean,
  onAgree: (boolean) => void,
  onUpdateReview: (ReviewType)=>void,
  onSave: (ReviewType)=>void,
  onClose: ()=>void
}

type Props = InputProps & {
  fullScreen: boolean,
  width: string,
}

class EditReviewDialog extends React.PureComponent<Props> {
  render() {
    const { settings, onClose, review, fullScreen } = this.props;
    return (
      <Dialog
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth='md'
        open={!! review}
        disableBackdropClick={true}
        onClose={onClose} >
        { review ? this.renderDialog(getProduct(review.productId, settings), review) : '' }
      </Dialog>
    );
  }

  renderDialog = (product: ProductInfoType, review: ReviewType) => {
    const { onClose, onSave, settings, stage, agreed } = this.props;
    const { name } = product;
    const errors = validateReview(settings.preferences.allowEmptyReviews, review);
    const withErrors = hasErrors(errors) || !agreed;
    const saving = stage === 'saving';
    const saved = stage === 'saved' || stage === 'failed';
    const closeLabel = saved ? __('Close') : __('Cancel');
    const isNew = review.id === -1;
    const buttons = [
      <Button key="close" onClick={onClose}>
        { closeLabel }
      </Button>
    ];

    if (! saved) {
      buttons.push(
        <Button key="create" disabled={saving || withErrors} onClick={() => onSave(review)} color="accent">
          { isNew ? __('Create review') : __('Update review') }
        </Button>
      );
    }
    return (
      <div>
        <DialogTitle>{__('Please review %s', name)}</DialogTitle>
        <DialogContent>
          { this.renderContent(product, review, errors)}
        </DialogContent>
        <DialogActions>
          { buttons }
        </DialogActions>
      </div>
    );
  }

  renderContent = (product: ProductInfoType, review: ReviewType, errors: ReviewFormErrors) => {
    const { id, grades } = review;
    const { stage } = this.props;
    const isNew = id === -1;
    if (stage === 'saving') {
      return this.renderSaving();
    }
    if (stage === 'saved' || stage === 'failed') {
      return this.renderSaved(isNew, stage === 'saved');
    }
    const criterion = isNew ? this.getUnsetCriterion(product.criteria, grades) : null;
    if (criterion) {
      return this.renderGrading(criterion, review);
    }
    return this.renderForm(review, product, errors);
  }

  getUnsetCriterion = (criteria: Array<number>, grades: Grades): ?CriterionType => {
    const key = find(k => !grades[k], criteria);
    if (key) {
      return this.props.settings.criteria[key];
    }
    return null;
  }

  renderGrading = (criterion: CriterionType, review: ReviewType) => {
    const { width, settings, onUpdateReview } = this.props;
    const grades = review.grades;
    const smallDevice = width === 'sm' || width == 'xs';
    const size = settings.shapeSize.create / (smallDevice ? 2 : 1);
    return (
      <div className={styles.single}>
        { this.renderProductImage(review) }
        <h2>{ criterion.label }</h2>
        <Grading
          shape={settings.shape}
          size={size}
          grade={0}
          onSetGrade={grade => onUpdateReview({ ...review, grades: assoc(criterion.id, grade, grades)})} />
      </div>
    );
  }

  renderProductImage = (review: ReviewType) => {
    const settings = this.props.settings;
    const product = settings.products[review.productId];
    return (
      <div className={styles.productImage}>
        <img src={fixUrl(product.image)} alt={product.name} />
      </div>
    );
  }

  renderForm = (review: ReviewType, product: ProductInfoType, errors: ReviewFormErrors) => {
    const { width, settings, onUpdateReview, agreed, onAgree, needConsent } = this.props;
    const smallDevice = width === 'sm' || width == 'xs';
    const image = product.image;
    const form = (
      <EditReviewForm
        product={product}
        settings={settings}
        review={review}
        needConsent={needConsent}
        agreed={agreed}
        onAgree={onAgree}
        onUpdateReview={onUpdateReview}
        errors={errors} />
    );
    return (smallDevice || !image) ? form : (
      <Grid container spacing={8} className={styles.minHeight}>
        <Grid item sm={4}>
          { this.renderProductImage(review) }
        </Grid>
        <Grid item sm={8}>
          { form}
        </Grid>
      </Grid>
    );
  }

  renderSaving = () => {
    return (
      <div className={styles.single}>
        <CircularProgress size={100} />
      </div>
    );
  }

  renderSaved = (isNew: boolean, success: boolean) => {
    const Icon = success ? Check: ErrorOutline;
    const message = getSaveMessage(isNew, success);
    const color = success ? 'primary' : 'error';
    const size = 120;
    return (
      <div className={styles.single}>
        <h2>{message}</h2>
        <Icon
          style={{width: size, height: size}}
          color={color} />
      </div>
    );
  }

  getProduct = (review: ReviewType): ProductInfoType => {
    const { settings } = this.props;
    return settings.products[review.productId];
  }
}


const getSaveMessage = (isNew, success) => {
  if (isNew) {
    return success ? __('Review has been created') : __('Failed to create review');
  }
  return success ? __('Review has been updated') : __('Failed to update review');
};

const makeResponsive = withMobileDialog({
  breakpoint: 'xs'
});

const Responsive: ComponentType<InputProps> = makeResponsive(EditReviewDialog);

export default Responsive;
