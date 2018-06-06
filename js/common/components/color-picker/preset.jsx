// @flow

import React from 'react';
import Circle from './circle';
import styles from './color-picker.less';
import type { PresetType } from './types';

type Props = PresetType & {
  onSelect: (string)=>void,
}

const COUNT = 10;
const WIDTH = 300 / COUNT;
const SIZE = WIDTH - 10;

class Preset extends React.PureComponent<Props> {
  static displayName = 'Preset';

  renderCircle = (color:string, i: number) => {
    return (
      <div key={i} className={styles.centered} style={{ width: WIDTH, height: WIDTH}}>
        <Circle
          className={styles.circle}
          key={i}
          size={SIZE}
          onClick={e => this.props.onSelect(color)}
          color={color} />
      </div>
    );
  };

  render() {
    const { label, colors } = this.props;
    const toRender = colors.slice(0, 10);
    const width = toRender.length * WIDTH;
    return width ? (
      <div className={styles.preset}>
        <div className={styles.label}>{label}</div>
        <div className={styles.colors} style={{ width }}>
          { toRender.map(this.renderCircle) }
        </div>
      </div>
    ) : null;
  }
}

export default Preset;
