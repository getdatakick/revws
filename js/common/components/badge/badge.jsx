// @flow
import type {Element} from "React";import React from 'react';
import styles from './badge.less';

type Props = {
  children: any,
  color?: string,
  backgroundColor?: string
};

class Badge extends React.PureComponent<Props> {
  static displayName: ?string = 'Badge';

  render(): Element<"span"> {
    const { children, color, backgroundColor } = this.props;
    const style = {
      color,
      backgroundColor
    };
    return (
      <span style={style} className={styles.badge}>
        { children }
      </span>
    );
  }
}

export default Badge;
