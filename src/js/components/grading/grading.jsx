// @flow
import React from 'react';
import classnames from 'classnames';
import { range, map } from 'ramda';
import type { GradingShapeType } from 'types';
import GradingShape from 'components/grading-shape/grading-shape';

type Props = {
  className?: string,
  grade: number,
  shape: GradingShapeType,
  size: number,
  onSetGrade?: (number)=>void
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
    return (
      <div className={classnames("revws-grading", this.props.className)}>
        { map(this.renderShape, range(1, 6)) }
      </div>
    );
  }

  renderShape = (id: number) => {
    const { shape, size, onSetGrade } = this.props;
    const grade = this.state.grade || this.props.grade;
    const padding = size/8;
    return (
      <div
        key={id}
        onMouseOver={onSetGrade ? () => this.onMouseOver(id) : undefined}
        onMouseOut={onSetGrade ? () => this.onMouseOut(id) : undefined}
        onClick={onSetGrade ? () => this.onClick(id) : undefined}
        style={{
          paddingLeft: padding,
          paddingRight: padding,
          cursor: onSetGrade ? 'pointer' : 'default'
        }}>
        <GradingShape
          shape={shape}
          size={size}
          highlighted={grade >= id && !!this.state.grade}
          on={grade >= id}
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

  onClick = (id: number) => {
    const { grade, onSetGrade } = this.props;
    this.setState({ grade: null });
    if (onSetGrade && grade != id) {
      onSetGrade(id);
    }
  }

}

export default Grading;
