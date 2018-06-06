// @flow
import React from 'react';
import classnames from 'classnames';

type Props = {
  className?:string,
  children: any
};

class Bootstrap extends React.PureComponent<Props> {
  static displayName = 'Bootstrap';

  static defaultProps = {};

  render() {
    const { children, className, ...rest } = this.props;
    return (
      <div className={classnames('bootstrap', className)} {...rest}>
        { children }
      </div>
    );
  }
}

export default Bootstrap;
