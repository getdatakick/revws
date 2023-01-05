// @flow

import type {Element} from 'react';
import React from 'react';
import classnames from 'classnames';
import Circle from './circle';
import styles from './color-picker.less';

type Props = {
  color: string,
  onChange: (string) => void,
};

type State = {
  color: string,
  valid: boolean
};

const isValidColor = (col: string) => /(^#[0-9A-F]{6}$)/i.test(col);

class Color extends React.PureComponent<Props, State> {
  static displayName: ?string = 'Color';

  state: State = {
    color: this.props.color,
    valid: true
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props, nextContext: any) {
    this.setState({
      color: nextProps.color,
      valid: true
    });
  }

  render(): Element<"div"> {
    const { color, valid } = this.state;
    const inputClazz = classnames(styles.input, {
      [ styles.invalid ]: !valid
    });
    return (
      <div className={styles.colorInput}>
        <input
          className={inputClazz}
          value={color}
          onChange={this.changeText}
          onBlur={this.fixText}
        />
        <Circle className={styles.color} color={valid ? color : this.props.color} size={26} />
      </div>
    );
  }

  changeText: ((e: any) => void) = (e: any) => {
    const color = e.target.value;
    const valid = isValidColor(color);
    this.setState({
      color,
      valid
    });
    if (valid) {
      this.props.onChange(color);
    }
  };

  fixText: (() => void) = () => {
    if (! this.state.valid) {
      this.setState({
        color: this.props.color,
        valid: true
      });
    }
  };
}

export default Color;
