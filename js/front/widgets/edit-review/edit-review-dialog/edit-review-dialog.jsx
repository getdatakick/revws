// @flow

import React from 'react';
import debounce from 'debounce';
import type { ComponentType } from 'react';
import type { EditStage, CriterionType, ReviewType, ReviewFormErrors, ProductInfoType, GradingType } from 'common/types';
import type { SettingsType, EntitiesType, VisitorType } from 'front/types';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle, withMobileDialog } from 'common/components/dialog';
import EditReviewForm from '../edit-review-form/edit-review-form';
import Grid from 'material-ui/Grid';
import Check from 'material-ui-icons/Check';
import ErrorOutline from 'material-ui-icons/ErrorOutline';
import { CircularProgress } from 'material-ui/Progress';
import { fixUrl } from 'common/utils/url';
import { validateReview, hasErrors } from 'common/utils/validation';
import { reject, isNil, find, prop, map } from 'ramda';
import { getProduct } from 'front/utils/entities';
import styles from './edit-review-dialog.less';
import Grades from './grades';
import { consentRequired } from 'front/utils/gdpr';

type InputProps = {
  stage: EditStage,
  settings: SettingsType,
  visitor: VisitorType,
  entities: EntitiesType,
  review: ?ReviewType,
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
    const { entities, onClose, review, fullScreen } = this.props;
    return (
      <Dialog
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth='md'
        open={!! review}
        disableBackdropClick={true}
        onClose={onClose} >
        { review ? this.renderDialog(getProduct(entities, review.productId), review) : '' }
      </Dialog>
    );
  }

  renderDialog = (product: ProductInfoType, review: ReviewType) => {
    const { onClose, onSave, settings, stage, agreed } = this.props;
    const { name } = product;
    const errors = validateReview(settings.preferences.allowEmptyReviews, review);
    const withErrors = hasErrors(errors) || (consentRequired(settings, review) && !agreed);
    const saving = stage === 'saving';
    const saved = stage === 'saved' || stage === 'failed';
    const closeLabel = saved ? __('Close') : __('Cancel');
    const isNew = review.id === -1;
    const buttons = [
      <Button key="close" onClick={onClose}>
        { closeLabel }
      </Button>
    ];

    const save = debounce(() => onSave(review), 300, true);
    const disabled = saving || withErrors;

    if (! saved) {
      buttons.push(
        <Button key="create" disabled={disabled} onClick={save} color="accent">
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
    if (isNew && this.hasUnsetCriterion(product.criteria, grades)) {
      return this.renderGrading(review, product);
    }
    return this.renderForm(review, product, errors);
  }

  hasUnsetCriterion = (criteria: Array<any>, grades: GradingType): ?CriterionType => {
    return !!find(k => !grades[k], criteria);
  }

  renderGrading = (review: ReviewType, product: ProductInfoType) => {
    const { width, settings, onUpdateReview } = this.props;
    const grades = review.grades;
    const smallDevice = width === 'sm' || width == 'xs';
    const size = settings.shapeSize.create / (smallDevice ? 2 : 1);
    const criteria = reject(isNil, map(key => prop(key, settings.criteria), product.criteria));
    return (
      <Grades
        product={product}
        criteria={criteria}
        grades={grades}
        size={size}
        shape={settings.shape}
        onSetGrades={grades => onUpdateReview({...review, grades})}/>
    );
  }

  renderProductImage = (product: ProductInfoType) => {
    return (
      <div className={styles.productImage}>
        <img src={fixUrl(product.image)} alt={product.name} />
      </div>
    );
  }

  renderForm = (review: ReviewType, product: ProductInfoType, errors: ReviewFormErrors) => {
    const { width, settings, onUpdateReview, agreed, onAgree, visitor } = this.props;
    const smallDevice = width === 'sm' || width == 'xs';
    const image = product.image;
    const form = (
      <EditReviewForm
        product={product}
        visitor={visitor}
        settings={settings}
        review={review}
        agreed={agreed}
        onAgree={onAgree}
        onUpdateReview={onUpdateReview}
        errors={errors} />
    );
    return (smallDevice || !image) ? form : (
      <Grid container spacing={8} className={styles.minHeight}>
        <Grid item sm={4}>
          { this.renderProductImage(product) }
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
