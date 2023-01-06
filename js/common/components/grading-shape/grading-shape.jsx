// @flow
import type {Element} from 'react';
import React from 'react';
import { mergeRight } from 'ramda';
import classnames from 'classnames';
import type { GradingShapeType, ShapeColorsType } from 'common/types.js';

type Props = {|
  id: number,
  shape: GradingShapeType,
  size: number,
  on: boolean,
  highlighted?: boolean,
  colors?: ShapeColorsType,
|};

class GradingShape extends React.PureComponent<Props> {
  static displayName: ?string = 'GradingShape';

  render(): Element<"svg"> {
    const { shape, size, on, highlighted, colors, id, ...rest } = this.props;
    const { path, viewBox, strokeWidth } = shape;
    const className = classnames('revws-grade', {
      'revws-grade-on': on,
      'revws-grade-off': !on,
      'revws-grade-highlight': highlighted
    });
    let pathStyle = { strokeWidth };
    if (colors) {
      pathStyle = mergeRight(pathStyle, {
        stroke: on ? colors.borderColor : colors.borderColorOff,
        fill:  on ? colors.fillColor : colors.fillColorOff
      });
    }
    const style = {
      width: size,
      height: size
    };
    return (
      <svg data-grade-id={id} className={className} style={style} viewBox={viewBox} width={size} height={size} {...rest}>
        <path d={path} style={pathStyle} />
      </svg>
    );
  }
}

export default GradingShape;
