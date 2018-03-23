// @flow
import React from 'react';
import classnames from 'classnames';
import { range, map } from 'ramda';
import type { GradingShapeType, ShapeColorsType } from 'common/types';
import GradingShape from 'common/components/grading-shape/grading-shape';
import { prevent } from 'common/utils/input';

type Props = {
  className?: string,
  grade: number,
  shape: GradingShapeType,
  size: number,
  type?: 'criterion' | 'product' | 'list' | 'create',
  onSetGrade?: (number)=>void,
  colors?: ShapeColorsType,
};

type State = {
  grade: ?number
};

class Grading extends React.PureComponent<Props, State> {
  static displayName = 'Grading';

  state = {
    grade: null
  };

  render() {
    const { onSetGrade, type, className } = this.props;
    const typeClass = type ? 'revws-grading-'+type : null;
    return (
      <div
        className={classnames("revws-grading", className, typeClass)}
        onTouchStart={onSetGrade ? this.onTouchMove : undefined}
        onTouchMove={onSetGrade ? this.onTouchMove : undefined}
        onTouchEnd={onSetGrade ? this.onTouchEnd : undefined} >
        { map(this.renderShape, range(1, 6)) }
      </div>
    );
  }

  renderShape = (id: number) => {
    const { shape, size, onSetGrade, colors } = this.props;
    const grade = Math.round(this.state.grade || this.props.grade);
    const padding = size/8;
    return (
      <div
        key={id}
        className={'revws-grade-wrap'}
        onMouseOver={onSetGrade ? () => this.onMouseOver(id) : undefined}
        onMouseOut={onSetGrade ? () => this.onMouseOut(id) : undefined}
        onClick={onSetGrade ? (e) => this.onClick(id, e) : undefined}
        style={{
          paddingLeft: padding,
          paddingRight: padding,
          cursor: onSetGrade ? 'pointer' : 'default'
        }}>
        <GradingShape
          data-grade-id={id}
          shape={shape}
          size={size}
          highlighted={grade >= id && !!this.state.grade}
          on={grade >= id}
          colors={colors}
        />
      </div>
    );
  }

  onMouseOver = (id: number) => {
    if (! this.state.grade && this.props.grade == id) {
      return;
    }
    this.setState({ grade: id });
  }

  onMouseOut = (id: number) => {
    this.setState({ grade: null });
  }

  onClick = (id: number, e?:any) => {
    prevent(e);
    const { grade, onSetGrade } = this.props;
    this.setState({ grade: null });
    if (onSetGrade && grade != id) {
      onSetGrade(id);
    }
  }

  onTouchMove = (e: any) => {
    prevent(e);
    if (e.changedTouches && e.changedTouches.length) {
      let node = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      while (node) {
        if (node.dataset && node.dataset.gradeId) {
          const grade = parseInt(node.dataset.gradeId);
          this.setState({ grade });
        }
        node = node.parentNode;
      }
    }
  }

  onTouchEnd = (e: any) => {
    prevent(e);
    if (this.state.grade) {
      this.onClick(this.state.grade);
    }
  }
}

export default Grading;
