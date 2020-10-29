// @flow
import type {Element} from "React";import React from 'react';
import classnames from 'classnames';
import { findIndex, assoc, has } from 'ramda';
import type { CriterionType, EntityInfoType, GradingShapeType, GradingType } from 'common/types';
import { fixUrl } from 'common/utils/url';
import Grading from 'common/components/grading/grading';

type Props = {
  shape: GradingShapeType,
  size: number,
  grades: GradingType,
  entity: EntityInfoType,
  criteria: Array<CriterionType>,
  onSetGrades: (GradingType) => void
};

type State = {
  slide: number,
  grades: GradingType
}

class Grades extends React.PureComponent<Props, State> {
  static displayName: ?string = 'Grades';

  state: State = getInitialState(this.props);

  render(): Element<"div"> {
    const { entity, criteria } = this.props;
    const { slide } = this.state;
    const cnt = criteria.length;
    const style = {
      width: (criteria.length * 100) + '%',
      left: (-slide * 100) + '%'
    };
    return (
      <div className='revws-dialog'>
        <img className='revws-product-image-small' src={fixUrl(entity.image)} alt={entity.name} />
        <div className='revws-dialog-slides-wrapper'>
          <div className='revws-dialog-slides' style={style}>
            { criteria.map(this.renderSlide) }
          </div>
        </div>
        {cnt > 1 && (
          <ul className='revws-dots'>
            { criteria.map(this.renderDot)}
          </ul>
        )}
      </div>
    );
  }

  renderSlide: ((criterion: CriterionType) => Element<"div">) = (criterion: CriterionType) => {
    const { size, shape } = this.props;
    const { grades } = this.state;
    const grade = grades[criterion.id] || 0;
    const { id, label } = criterion;
    return (
      <div key={id} className='revws-dialog-slide'>
        <h2>{ label }</h2>
        <Grading
          shape={shape}
          size={size}
          grade={grade}
          onSetGrade={this.onSetGrades(id)} />
      </div>
    );
  }

  renderDot: ((criterion: CriterionType, index: number) => Element<"li">) = (criterion: CriterionType, index:number) => {
    const slide = this.state.slide;
    const id = criterion.id;
    const clazz = classnames('revws-dot', {
      'revws-dot-active': slide == index
    });
    return (
      <li
        key={id}
        onClick={this.setSlide(index)}
        className={clazz} />
    );
  }

  onSetGrades: ((criterionId: number) => (grade: number) => void) = (criterionId: number) => (grade: number) => {
    const { onSetGrades, criteria } = this.props;
    const grades = assoc(criterionId, grade, this.state.grades);
    const slide = getUnreviewdSlide(criteria, grades);
    if (slide === -1) {
      onSetGrades(grades);
    } else {
      this.setState({ grades, slide });
    }
  }

  setSlide: ((slide: number) => (e: any) => void) = (slide: number) => (e: any) => {
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
