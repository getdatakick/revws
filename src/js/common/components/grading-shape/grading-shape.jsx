// @flow
import React from 'react';
import classnames from 'classnames';
import type { GradingShapeType } from 'common/types';

type Props = {
  shape: GradingShapeType,
  size: number,
  on: boolean,
  highlighted?: boolean
};

class GradingShape extends React.PureComponent<Props> {
  static displayName = 'GradingShape';

  render() {
    const { shape, size, on, highlighted, ...rest } = this.props;
    const { path, viewBox } = shape;
    const className = classnames('revws-grade', {
      'revws-grade-on': on,
      'revws-grade-off': !on,
      'revws-grade-highlight': highlighted
    });
    return (
      <svg className={className} viewBox={viewBox} width={size} height={size} {...rest}>
        <path d={path} />
      </svg>
    );
  }
}

export default GradingShape;
