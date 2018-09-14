// @flow
import React from 'react';
import type { ReviewType, ReviewFormErrors, ProductInfoType } from 'common/types';
import type { SettingsType, VisitorType } from 'front/types';
import { map, propOr, assoc } from 'ramda';
import TextField from 'material-ui/TextField';
import Grading from 'common/components/grading/grading';
import TextArea from 'common/components/text-area/text-area';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import { isLoggedIn, isGuest } from 'front/utils/visitor';
import { consentRequired } from 'front/utils/gdpr';

type Props = {
  settings: SettingsType,
  visitor: VisitorType,
  product: ProductInfoType,
  errors: ReviewFormErrors,
  review: ReviewType,
  agreed: boolean,
  onAgree: (boolean) => void,
  onUpdateReview: (ReviewType)=>void,
}

type State = {
  editAuthor: boolean
}

class EditReviewForm extends React.PureComponent<Props, State> {
  static displayName = 'EditReviewForm';

  state = {
    editAuthor: false
  }

  render() {
    const { review, errors, product } = this.props;
    const { title, content } = review;
    return (
      <div className='revws-review-form'>
        { map(this.renderCriterion, product.criteria)}
        { this.renderAuthor() }
        <TextField
          id="title"
          label={__("Review title")}
          placeholder={__("Please enter review title")}
          className='revws-review-form-input'
          value={title}
          onChange={this.update('title')}
          error={!! errors.title}
          fullWidth
          autoFocus />
        <TextArea
          className='revws-review-form-input'
          label={__("Review details")}
          value={content}
          error={!! errors.content}
          placeholder={__("Please enter review details")}
          onChange={this.update('content')} />
        { this.renderConsent() }
      </div>
    );
  }

  renderCriterion = (critKey: number) => {
    const { settings, review } = this.props;
    const criteria = settings.criteria;
    const grade = propOr(0, critKey, review.grades);
    const criterion = criteria[critKey];
    if (criterion) {
      return (
        <div key={critKey} className='revws-review-form-criterion'>
          <span className='revws-review-form-criterion-label'>{criterion.label}</span>
          <Grading
            shape={settings.shape}
            size={18}
            grade={grade}
            onSetGrade={(grade) => this.onSetGrade(critKey, grade)} />
        </div>
      );
    }
  }

  renderAuthor = () => {
    const { review, visitor } = this.props;
    const editing = review.id != -1;
    const editAuthor = this.state.editAuthor;
    if (!editAuthor && (editing || isLoggedIn(visitor))) {
      return this.renderAuthorShort(review);
    } else {
      return this.renderAuthorInputs();
    }
  }

  renderAuthorShort = (review: ReviewType) => (
    <div className='revws-review-form-author'>
      {__('by')} <a onClick={this.editAuthor}>{review.displayName}</a>
    </div>
  );

  renderAuthorInputs = () => {
    const { review, errors, visitor } = this.props;
    const ret = [
      <div key="space" className='revws-review-form-author-input' />,
      <TextField
        key="author"
        id="author"
        className='revws-review-form-input'
        label={__("Your name")}
        placeholder={__("Please enter your name")}
        value={review.displayName}
        onChange={this.update('displayName')}
        error={!! errors.displayName}
        fullWidth />
    ];
    if (isGuest(visitor)) {
      ret.push(
        <TextField
          key="email"
          id="email"
          className='revws-review-form-input'
          label={__("Your email address")}
          placeholder={__("Please enter your email address")}
          value={review.email}
          onChange={this.update('email')}
          error={!! errors.email}
          fullWidth />
      );
    }
    return ret;
  }

  renderConsent = () => {
    const { review, settings, agreed, onAgree } = this.props;
    if (consentRequired(settings, review)) {
      const markup = {
        __html: settings.gdpr.text || __('By submitting this review you agree to use of your data as outlined in our privacy policy')
      };
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={agreed}
              onChange={() => onAgree(!agreed)} />
          }
          label={(
            <span className='revws-review-form-consent' dangerouslySetInnerHTML={markup} />
          )} />
      );
    }
  }

  editAuthor = () => {
    this.setState({
      editAuthor: true
    });
  }

  update = (key: string) => (e: any) => {
    const { review, onUpdateReview } = this.props;
    onUpdateReview({ ...review, [ key ]: e.target.value });
  }

  onSetGrade = (criterion: number, grade: number) => {
    const { review, onUpdateReview } = this.props;
    const grades = assoc(criterion, grade, review.grades);
    onUpdateReview({ ...review, grades });
  }
}

export default EditReviewForm;
