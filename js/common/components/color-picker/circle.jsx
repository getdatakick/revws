// @flow

import type {Element} from "React";import React from 'react';
import { merge } from 'ramda';

type Props = {
  color: string,
  size: number,
  onClick?: ()=>void,
  style?: {}
};

class Circle extends React.PureComponent<Props> {
  static displayName: ?string = 'ColorPicker/Circle';

  render(): Element<"div"> {
    const { color, size, onClick, style={} } = this.props;
    const merged = merge({
      width: size,
      height: size,
      border: '1px solid #ddd',
      backgroundColor: color,
      borderRadius: size,
      cursor: onClick ? 'pointer' : 'default'
    }, style);

    return <div style={merged} onClick={onClick} />;
  }
}

export default Circle;
