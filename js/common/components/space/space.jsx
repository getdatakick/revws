// @flow
import type {Element} from "React";import React from 'react';
import classnames from 'classnames';

type Props = {|
  small?: boolean,
  large?: boolean,
  className?: string
|};

class Space extends React.PureComponent<Props> {
  static displayName: ?string = 'Space';

  render(): Element<"div"> {
    const { small, large, className, ...rest } = this.props;
    const clazz = classnames(className, 'revws-space', {
      'revws-space-small': small,
      'revws-space-large': large,
    });
    return (
      <div className={clazz} {...rest} />
    );
  }
}

export default Space;
