// @flow
import React from 'react';
import styles from './style.less';
import Paper from 'material-ui/Paper';

type Props = {
  id: string,
  label: string,
  subheader: ?string,
  children: any
};

class SettingsSection extends React.PureComponent<Props> {
  render() {
    const { id, subheader, label, children } = this.props;
    return (
      <Paper id={id} className={styles.section}>
        <h2 className={styles.sectionLabel}>{ label }</h2>
        {subheader && (
          <div className={styles.subheader}>
            {subheader}
          </div>
        )}
        <div className={styles.sectionContent}>
          { children }
        </div>
      </Paper>
    );
  }
}

export default SettingsSection;
