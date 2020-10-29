// @flow
import type {Element} from "React";import React from 'react';
import classnames from 'classnames';

type Props = {|
  className: ?string,
  children: any
|};

class Bootstrap extends React.PureComponent<Props> {
  static displayName: ?string = 'Bootstrap';

  render(): Element<"div"> {
    const { children, className, ...rest } = this.props;
    return (
      <div className={classnames('bootstrap', className)} {...rest}>
        { children }
      </div>
    );
  }
}

export default Bootstrap;
