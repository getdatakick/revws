// @flow
import type {Element} from "React";import React from 'react';
import styles from './page-with-footer.less';
import classnames from 'classnames';

type Props = {
  content: any,
  footer: any,
  showFooter: boolean
};

class PageWithFooter extends React.PureComponent<Props> {
  static displayName: ?string = 'PageWithFooter';

  render(): Element<"div"> {
    const { content, footer, showFooter } = this.props;
    const clazz = classnames(styles.footer, {
      [ styles.open ]: showFooter
    });
    return (
      <div className={styles.root}>
        <div className={styles.content}>
          { content }
        </div>
        <div className={clazz}>
          <div className={styles.footerContent}>
            { footer }
          </div>
        </div>
      </div>
    );
  }
}

export default PageWithFooter;
