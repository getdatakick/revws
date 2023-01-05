// @flow
import type {Node, Element} from 'react';
import React from 'react';
import type { LanguagesType, ReviewType, ReviewFormErrors, CriteriaType, GradingShapeType, LanguageType } from 'common/types';
import moment from 'moment';
import { toPairs, pathOr, keys } from 'ramda';
import { isArray } from 'common/utils/ramda';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Grading from 'common/components/grading/grading';
import TextArea from 'common/components/text-area/text-area';
import Checkbox from 'material-ui/Checkbox';
import styles from './edit-review-form.less';
import { FormControlLabel } from 'material-ui/Form';
import { FormControl } from 'material-ui/Form';
import { MenuItem } from 'material-ui/Menu';
import { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';

type Props = {
  errors: ReviewFormErrors,
  language: number,
  languages: LanguagesType,
  criteria: CriteriaType,
  usedCriteria: ?Array<number>,
  shape: GradingShapeType,
  review: ReviewType,
  onUpdateReview: (ReviewType)=>void,
}

class EditReviewForm extends React.PureComponent<Props> {
  static displayName: ?string = 'EditReviewForm';

  render(): Element<"div"> {
    const { review, errors, usedCriteria, languages } = this.props;
    const { title, content, language, date } = review;
    const criteria = usedCriteria || keys(review.grades);
    const langs = toPairs(languages);
    return (
      <div className={styles.root}>
        <Grid container spacing={40}>
          <Grid item md={6}>
            <TextField
              key="author"
              id="author"
              label={__("Reviewer name")}
              placeholder={__("Please enter customer name")}
              value={review.displayName}
              onChange={this.update('displayName')}
              error={!! errors.displayName}
              fullWidth />
            <TextField
              key="email"
              id="email"
              className={styles.input}
              label={__("Reviewer email")}
              placeholder={__("Please enter reviewer email")}
              value={review.email}
              onChange={this.update('email')}
              error={!! errors.email}
              fullWidth />
            <FormControlLabel
              className={styles.formControl}
              control={
                <Checkbox
                  checked={review.verifiedBuyer}
                  onChange={this.toggleVerifiedBuyer} />
              }
              label={__("Verified buyer")} />
            <Grid container spacing={40} className={styles.formControl}>
              <Grid item md={6}>
                <FormControl>
                  <InputLabel>{__('Review language')}</InputLabel>
                  <Select value={language} onChange={this.update('language')}>
                    { langs.map(this.renderLanguage) }
                  </Select>
                </FormControl>
              </Grid>
              <Grid item md={6}>
                <TextField
                  id="date"
                  label="Review Date"
                  type="date"
                  value={moment(date).format('YYYY-MM-DD')}
                  onChange={this.setDate}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={6}>
            <h3>{__('Ratings')}</h3>
            { criteria.map(this.renderCriterion) }
          </Grid>
        </Grid>
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
      </div>
    );
  }

  renderCriterion: ((critKey: number) => void | Element<"div">) = (critKey: number) => {
    const { criteria, shape, language, review } = this.props;
    const grade = pathOr(0, ['grades', critKey], review);
    const criterion = criteria[critKey];
    if (criterion) {
      const label = isArray(criterion.label) ? criterion.label[language] : criterion.label;
      return (
        <div key={critKey} className={styles.criterion}>
          <Grading
            className={styles.grading}
            shape={shape}
            size={25}
            grade={grade}
            onSetGrade={(grade) => this.onSetGrade(critKey, grade)} />
          <span className={styles.criterionLabel}>{label}</span>
        </div>
      );
    }
  }

  renderLanguage: ((pair: [string, LanguageType]) => Node) = (pair: [string, LanguageType]) => {
    const key = parseInt(pair[0], 10);
    const name = pair[1].name;
    return (
      <MenuItem key={key} value={key}>{name}</MenuItem>
    );
  }

  update: ((key: string) => (e: any) => void) = (key: string) => (e: any) => {
    const { review, onUpdateReview } = this.props;
    onUpdateReview({ ...review, [ key ]: e.target.value });
  }

  setDate: ((e: any) => void) = (e: any) => {
    const value = e.target.value;
    if (value) {
      const m = moment(value, 'YYYY-MM-DD');
      if (m.isValid()) {
        const { review, onUpdateReview } = this.props;
        onUpdateReview({ ...review, date: m.toDate() });
      }
    }
  }

  toggleVerifiedBuyer: ((e: any) => void) = (e: any) => {
    const { review, onUpdateReview } = this.props;
    onUpdateReview({ ...review, verifiedBuyer: !review.verifiedBuyer });
  }

  onSetGrade: ((criterion: number, grade: number) => void) = (criterion: number, grade: number) => {
    const { review, onUpdateReview } = this.props;
    const grades = {
      ...review.grades,
      [ criterion ]: grade
    };
    onUpdateReview({ ...review, grades });
  }
}

export default EditReviewForm;
