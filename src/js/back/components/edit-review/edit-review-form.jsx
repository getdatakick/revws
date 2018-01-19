// @flow
import React from 'react';
import type { ReviewType, ReviewFormErrors, CriteriaType, GradingShapeType } from 'common/types';
import { values, mapObjIndexed, assoc } from 'ramda';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Grading from 'common/components/grading/grading';
import TextArea from 'common/components/text-area/text-area';
import styles from './edit-review-form.less';


type Props = {
  errors: ReviewFormErrors,
  language: number,
  criteria: CriteriaType,
  shape: GradingShapeType,
  review: ReviewType,
  onUpdateReview: (ReviewType)=>void,
}

class EditReviewForm extends React.PureComponent<Props> {
  static displayName = 'EditReviewForm';

  render() {
    const { review, errors } = this.props;
    const { title, content, grades } = review;
    return (
      <div className={styles.root}>
        <Grid container spacing={40}>
          <Grid item md={6}>
            <TextField
              key="author"
              id="author"
              label="Reviewer name"
              placeholder="Please enter customer name"
              value={review.displayName}
              onChange={this.update('displayName')}
              error={!! errors.displayName}
              fullWidth />
            <TextField
              key="email"
              id="email"
              className={styles.input}
              label="Reviewer email"
              placeholder="Please enter reviewer email"
              value={review.email}
              onChange={this.update('email')}
              error={!! errors.email}
              fullWidth />
          </Grid>
          <Grid item md={6}>
            <h3>Ratings</h3>
            { values(mapObjIndexed(this.renderCriterion, grades)) }
          </Grid>
        </Grid>
        <TextField
          id="title"
          label="Review title"
          placeholder="Please enter review title"
          className={styles.input}
          value={title}
          onChange={this.update('title')}
          error={!! errors.title}
          fullWidth
          autoFocus />
        <TextArea
          className={styles.input}
          label="Review details"
          value={content}
          error={!! errors.content}
          placeholder="Please enter review details"
          onChange={this.update('content')} />
      </div>
    );
  }

  renderCriterion = (grade: number, key: string) => {
    const critKey = parseInt(key, 10);
    const { criteria, shape, language } = this.props;
    const criterion = criteria[critKey];
    if (criterion) {
      return (
        <div key={critKey} className={styles.criterion}>
          <Grading
            className={styles.grading}
            shape={shape}
            size={25}
            grade={grade}
            onSetGrade={(grade) => this.onSetGrade(critKey, grade)} />
          <span className={styles.criterionLabel}>{criterion.label[language]}</span>
        </div>
      );
    }
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
