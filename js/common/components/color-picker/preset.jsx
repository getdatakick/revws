// @flow

import type {Element} from 'react';
import React from 'react';
import Circle from './circle';
import styles from './color-picker.less';

type Props = {|
  label: string,
  colors: Array<string>,
  onSelect: string => void
|}

const COUNT = 10;
const WIDTH = 300 / COUNT;
const SIZE = WIDTH - 10;

class Preset extends React.PureComponent<Props> {
  static displayName: ?string = 'Preset';

  renderCircle: ((color: string, i: number) => Element<"div">) = (color:string, i: number) => {
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

  render(): null | Element<"div"> {
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
