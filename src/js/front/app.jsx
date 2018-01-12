// @flow

import type { SettingsType } from 'front/types';
import React from 'react';
import ReviewList from 'front/pages/review-list';
import CreateReview from 'front/pages/edit-review';
import DeleteReview from 'front/pages/delete-review';
import Snackbar from 'front/pages/snackbar';
import AppTheme from 'common/components/theme/theme';

type Props = {
  settings: SettingsType
};

class FrontApp extends React.PureComponent<Props> {
  static displayName = 'FrontApp';

  render() {
    const { settings } = this.props;
    return (
      <AppTheme htmlFontSize={10}>
        <ReviewList settings={settings} />
        <CreateReview settings={settings} />
        <DeleteReview />
        <Snackbar />
      </AppTheme>
    );
  }
}

export default FrontApp;
