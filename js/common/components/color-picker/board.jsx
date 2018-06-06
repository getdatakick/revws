// @flow

import React from 'react';
import classnames from 'classnames';
import { clamp } from 'ramda';
import ReactDOM from 'react-dom';
import Colr from 'colr';
import styles from './color-picker.less';
import type { HSV, Position } from './types';

const colr = new Colr();

const WIDTH = 300;
const HEIGHT = 250;
const xpos = clamp(0, WIDTH);
const ypos = clamp(0, HEIGHT);

type Props = {
  className: ?string,
  hsv: HSV,
  onDragStart: ()=>void,
  onDragEnd: ()=>void,
  onChange: (HSV)=>void
}

export default class extends React.PureComponent<Props> {
  static displayName = 'ColorPicker/Board';

  unloaded = false;

  componentWillUnmount() {
    this.unloaded = true;
    this.removeListeners(false);
    this.removeTouchListeners(false);
  }

  onBoardMouseDown = (e: any) => {
    const x = e.clientX;
    const y = e.clientY;
    this.pointMoveTo({ x, y, });

    this.props.onDragStart();
    window.addEventListener('mousemove', this.onBoardDrag, false);
    window.addEventListener('mouseup', this.onBoardDragEnd, false);
  };

  onBoardTouchStart = (e: any) => {
    if (e.touches.length !== 1) {
      return;
    }

    const x = e.targetTouches[0].clientX;
    const y = e.targetTouches[0].clientY;
    this.pointMoveTo({ x, y, });
    this.props.onDragStart();
    window.addEventListener('touchmove', this.onBoardTouchMove, false);
    window.addEventListener('touchend', this.onBoardTouchEnd, false);
  };

  onBoardTouchMove = (e: any) => {
    if (e.preventDefault) {
      e.preventDefault();
    }

    const x = e.targetTouches[0].clientX;
    const y = e.targetTouches[0].clientY;
    this.pointMoveTo({ x, y, });
  };

  onBoardTouchEnd = () => {
    this.removeTouchListeners(true);
  };

  onBoardDrag = (e: any) => {
    const x = e.clientX;
    const y = e.clientY;
    this.pointMoveTo({ x, y, });
  };

  onBoardDragEnd = (e: any) => {
    const x = e.clientX;
    const y = e.clientY;
    this.pointMoveTo({ x, y, });
    this.removeListeners(true);
  };

  removeTouchListeners = (trigger: boolean) => {
    window.removeEventListener('touchmove', this.onBoardTouchMove, false);
    window.removeEventListener('touchend', this.onBoardTouchEnd, false);
    trigger && this.props.onDragEnd();
  };

  removeListeners = (trigger: boolean) => {
    window.removeEventListener('mousemove', this.onBoardDrag, false);
    window.removeEventListener('mouseup', this.onBoardDragEnd, false);
    trigger && this.props.onDragEnd();
  };

  pointMoveTo = (pos: Position) => {
    if (!this.unloaded) {
      const node = ReactDOM.findDOMNode(this);
      if (node && node instanceof HTMLElement) {
        const rect = node.getBoundingClientRect();
        const left = xpos(pos.x - rect.left);
        const top = ypos(pos.y - rect.top);
        const { hsv, onChange } = this.props;
        onChange({
          h: hsv.h,
          s: parseInt(left/WIDTH * 100, 10),
          v: parseInt((1 - top/HEIGHT) * 100, 10),
        });
      }
    }
  };

  render() {
    const { hsv, className } = this.props;
    const hueHsv = [hsv.h, 100, 100];
    const hueColor = colr.fromHsvArray(hueHsv).toHex();
    const x = hsv.s / 100 * WIDTH - 4;
    const y = (1 - hsv.v / 100) * HEIGHT - 4;
    return (
      <div className={classnames(className, styles.board)}>
        <div className={styles.hsv} style={{backgroundColor: hueColor}}>
          <div className={styles.value}/>
          <div className={styles.saturation}/>
        </div>
        <span style={{left: x, top: y}}/>

        <div
          className={styles.handler}
          onMouseDown={this.onBoardMouseDown}
          onTouchStart={this.onBoardTouchStart}
        />
      </div>
    );
  }
}
