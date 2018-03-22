// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import styles from './color-picker.less';
import type { Position } from './types';

type Props = {
  hue: number,
  onChange: (number)=>void,
  height: number
};

export default class extends React.PureComponent<Props> {
  static displayName = 'ColorPicker/Ribbon';

  static defaultProps = {
    height: 14
  };

  unloaded = false;

  componentWillUnmount() {
    this.unloaded = true;
    this.removeListeners();
  }

  onMouseDown = (e: any) => {
    const x = e.clientX;
    const y = e.clientY;

    this.pointMoveTo({ x, y, });

    window.addEventListener('mousemove', this.onDrag, false);
    window.addEventListener('mouseup', this.onDragEnd, false);
  };

  onDrag = (e: any) => {
    const x = e.clientX;
    const y = e.clientY;
    this.pointMoveTo({ x, y, });
  };

  onDragEnd = (e: any) => {
    const x = e.clientX;
    const y = e.clientY;
    this.pointMoveTo({ x, y, });
    this.removeListeners();
  };

  pointMoveTo = (coords: Position) => {
    if (!this.unloaded) {
      const node = ReactDOM.findDOMNode(this);
      if (node && node instanceof HTMLElement) {
        const rect = node.getBoundingClientRect();
        const width = rect.width;
        let left = coords.x - rect.left;
        left = Math.max(0, left);
        left = Math.min(left, width);
        const huePercent = left / width;
        const hue = huePercent * 360;
        this.props.onChange(hue);
      }
    }
  };

  removeListeners = () => {
    window.removeEventListener('mousemove', this.onDrag, false);
    window.removeEventListener('mouseup', this.onDragEnd, false);
  };

  render() {
    const { height, hue } = this.props;
    const per = hue / 360 * 100;
    return (
      <div className={styles.ribbon} style={{height}} >
        <span style={{left: per + '%'}} />
        <div className={styles.handler} onMouseDown={this.onMouseDown} />
      </div>
    );
  }
}
