// @flow

import React from 'react';
import { equals, assoc, reject, isEmpty } from 'ramda';
import Colr from 'colr';
import Board from './board';
import Ribbon from './ribbon';
import Color from './color';
import Preset from './preset';
import styles from './color-picker.less';
import type { HSV, PresetType } from './types';

type Props = {
  color: string,
  onChange: (string)=>void,
  presets?: Array<PresetType>
};

type State = {
  dragging: boolean,
  hsv: HSV
}

const colr = new Colr();
const toHex = (hsv) => {
  if (hsv) {
    return colr.fromHsvObject(hsv).toHex();
  }
  throw new Error('Invalid HSV object');
};

const fromHex = (hex) => {
  if (hex) {
    return colr.fromHex(hex).toHsvObject();
  }
  throw new Error('Invalid HEX');
};

export default class extends React.PureComponent<Props, State> {
  static displayName = 'ColorPicker';

  static defaultProps = {
    presets: [
      {
        label: __('Basic colors'),
        colors: ['#ffffff', '#ffd200', '#f47b20', '#d31245', '#eb4498', '#c1d82f', '#68c8c6', '#00a5d9', '#52247f', '#000000']
      }
    ]
  };

  state = {
    dragging: false,
    hsv: fromHex(this.props.color)
  };

  onChange = (hsv: HSV) => {
    if (!equals(hsv, this.state.hsv)) {
      this.setState({ hsv });
      const hex = toHex(hsv);
      this.changeHexColor(hex);
    }
  };

  changeHexColor = (hex: string) => {
    if (hex != this.props.color) {
      this.props.onChange(hex);
    }
  };

  onHueChange = (hue: number) => {
    this.onChange(assoc('h', hue, this.state.hsv));
  };

  componentWillReceiveProps(nextProps: Props) {
    if (! this.state.dragging && nextProps.color) {
      this.setState({
        hsv: fromHex(nextProps.color)
      });
    }
  }

  startDragging = () => {
    this.setState({
      dragging: true
    });
  };

  endDragging = () => {
    this.setState({
      dragging: false
    });
  };

  renderPreset = (preset: PresetType, i: number) => {
    return (
      <div key={'preset-'+i} className={styles.wrapper}>
        <Preset
          {...preset}
          onSelect={this.changeHexColor} />
      </div>
    );
  };

  render() {
    const color = this.props.color;
    const { hsv } = this.state;
    const presets = getPresets(this.props.presets);
    const hasPresets = presets.length > 0;
    return (
      <div className={styles.colorPicker}>
        <div>
          { presets.map(this.renderPreset) }
          <Board
            className={hasPresets ? styles.wrapper : null}
            hsv={hsv}
            onChange={this.onChange}
            onDragStart={this.startDragging}
            onDragEnd={this.endDragging} />
          <div className={styles.wrapper}>
            <Ribbon
              hue={hsv.h}
              onChange={this.onHueChange} />
          </div>
          <div className={styles.wrapper}>
            <Color
              color={color}
              onChange={this.changeHexColor} />
          </div>
        </div>
      </div>
    );
  }

  initColor = () => {
    this.changeHexColor('#FFFFFF');
  };
}

const emptyPreset = (preset) => isEmpty(preset.colors);
const getPresets = (presets=[]) => reject(emptyPreset, presets);
