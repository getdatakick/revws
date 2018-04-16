// @flow
import React from 'react';
import styles from './section.less';
import Paper from 'material-ui/Paper';

type Props = {
  id: string,
  label: string,
  subheader?: ?string,
  children: any,
  indent: boolean
};

class SettingsSection extends React.PureComponent<Props> {

  static defaultProps = {
    indent: true
  }

  render() {
    const { id, subheader, label, children, indent } = this.props;
    return (
      <Paper id={id} className={styles.section}>
        <h2 className={styles.sectionLabel}>{ label }</h2>
        {subheader && (
          <div className={styles.subheader}>
            {subheader}
          </div>
        )}
        <div className={indent ? styles.sectionContent : null}>
          { children }
        </div>
      </Paper>
    );
  }
}

export default SettingsSection;
