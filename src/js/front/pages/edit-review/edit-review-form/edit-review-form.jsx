// @flow
import React from 'react';
import classnames from 'classnames';
import type { ReviewType, ReviewFormErrors, ProductInfoType } from 'common/types';
import type { SettingsType } from 'front/types';
import { map, propOr, assoc } from 'ramda';
import TextField from 'material-ui/TextField';
import Grading from 'common/components/grading/grading';
import TextArea from 'common/components/text-area/text-area';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel } from 'material-ui/Form';
import { isLoggedIn } from 'front/settings';
import styles from './edit-review-form.less';


type Props = {
  settings: SettingsType,
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
      <div className={styles.root}>
        { map(this.renderCriterion, product.criteria)}
        { this.renderAuthor() }
        <TextField
          id="title"
          label={__("Review title")}
          placeholder={__("Please enter review title")}
          className={styles.input}
          value={title}
          onChange={this.update('title')}
          error={!! errors.title}
          fullWidth
          autoFocus />
        <TextArea
          className={styles.input}
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
        <div key={critKey} className={styles.criterion}>
          <span className={styles.criterionLabel}>{criterion.label}</span>
          <Grading
            className={styles.grading}
            shape={settings.shape}
            size={18}
            grade={grade}
            onSetGrade={(grade) => this.onSetGrade(critKey, grade)} />
        </div>
      );
    }
  }

  renderAuthor = () => {
    const { settings, review } = this.props;
    const editing = review.id != -1;
    const editAuthor = this.state.editAuthor;
    if (!editAuthor && (editing || isLoggedIn(settings))) {
      return this.renderAuthorShort(review);
    } else {
      return this.renderAuthorInputs();
    }
  }

  renderAuthorShort = (review: ReviewType) => (
    <div className={classnames(styles.subtitle, styles.marginBottom)}>
      {__('by')} <a className={styles.author} onClick={this.editAuthor}>{review.displayName}</a>
    </div>
  );

  renderAuthorInputs = () => {
    const { review, errors, settings } = this.props;
    const ret = [
      <div key="space" className={styles.marginBottom} />,
      <TextField
        key="author"
        id="author"
        className={styles.input}
        label={__("Your name")}
        placeholder={__("Please enter your name")}
        value={review.displayName}
        onChange={this.update('displayName')}
        error={!! errors.displayName}
        fullWidth />
    ];
    if (! isLoggedIn(settings)) {
      ret.push(
        <TextField
          key="email"
          id="email"
          className={styles.input}
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
    const editing = review.id != -1;
    if (settings.gdpr.active && !editing) {
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
            <span className={styles.gdpr} dangerouslySetInnerHTML={markup} />
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
