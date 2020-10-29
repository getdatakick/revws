// @flow

import type {Element} from "React";import React from 'react';
import classnames from 'classnames';
import styles from './markdown.less';
import { toHTML } from 'back/utils/markdown';

type Props = {
  content: string,
  className?: string,
}

class Markdown extends React.PureComponent<Props> {
  static displayName: ?string = 'Markdown';

  render(): null | Element<"div"> {
    const { content, className, ...rest } = this.props;
    const __html = content ? toHTML(content) : null;
    return content ? (
      <div
        {...rest}
        className={classnames(styles.markdown, className)}
        dangerouslySetInnerHTML={{ __html }}
      />
    ) : null;
  }
}

export default Markdown;
