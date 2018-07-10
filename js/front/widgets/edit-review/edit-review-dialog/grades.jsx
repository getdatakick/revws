// @flow
import React from 'react';
import classnames from 'classnames';
import { findIndex, assoc, has } from 'ramda';
import type { CriterionType, ProductInfoType, GradingShapeType, GradingType } from 'common/types';
import styles from './edit-review-dialog.less';
import { fixUrl } from 'common/utils/url';
import Grading from 'common/components/grading/grading';

type Props = {
  shape: GradingShapeType,
  size: number,
  grades: GradingType,
  product: ProductInfoType,
  criteria: Array<CriterionType>,
  onSetGrades: (GradingType) => void
};

type State = {
  slide: number,
  grades: GradingType
}

class Grades extends React.PureComponent<Props, State> {
  static displayName = 'Grades';

  state = getInitialState(this.props);

  render() {
    const { product, criteria } = this.props;
    const { slide } = this.state;
    const cnt = criteria.length;
    const style = {
      width: (criteria.length * 100) + '%',
      left: (-slide * 100) + '%'
    };
    return (
      <div className={styles.single}>
        <div className={styles.productImage}>
          <img src={fixUrl(product.image)} alt={product.name} />
        </div>
        <div className={styles.slidesWrapper}>
          <div className={styles.slides} style={style}>
            { criteria.map(this.renderSlide) }
          </div>
        </div>
        {cnt > 1 && (
          <ul className={styles.dots}>
            { criteria.map(this.renderDot)}
          </ul>
        )}
      </div>
    );
  }

  renderSlide = (criterion: CriterionType) => {
    const { size, shape } = this.props;
    const { grades } = this.state;
    const grade = grades[criterion.id] || 0;
    const { id, label } = criterion;
    return (
      <div key={id} className={styles.slide}>
        <h2>{ label }</h2>
        <Grading
          shape={shape}
          size={size}
          grade={grade}
          onSetGrade={this.onSetGrades(id)} />
      </div>
    );
  }

  renderDot = (criterion: CriterionType, index:number) => {
    const slide = this.state.slide;
    const id = criterion.id;
    const clazz = classnames(styles.dot, {
      [ styles.dotActive ]: slide == index
    });
    return (
      <li
        key={id}
        onClick={this.setSlide(index)}
        className={clazz} />
    );
  }

  onSetGrades = (criterionId: number) => (grade: number) => {
    const { onSetGrades, criteria } = this.props;
    const grades = assoc(criterionId, grade, this.state.grades);
    const slide = getUnreviewdSlide(criteria, grades);
    if (slide === -1) {
      onSetGrades(grades);
    } else {
      this.setState({ grades, slide });
    }
  }

  setSlide = (slide: number) => (e: any) => {
    this.setState({ slide });
  }
}

const getInitialState = (props: Props) => ({
  slide: getUnreviewdSlide(props.criteria, props.grades),
  grades: props.grades
});

const getUnreviewdSlide = (criteria, grades) => {
  if (criteria.length) {
    return findIndex(crit => !has(crit.id, grades), criteria);
  }
  return -1;
};

export default Grades;
