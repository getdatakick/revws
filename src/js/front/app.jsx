// @flow

import type { SettingsType } from 'front/types';
import React from 'react';
import ProductReviewList from 'front/pages/product-review-list';
import CustomertReviewList from 'front/pages/customer-review-list';
import EditReview from 'front/pages/edit-review';
import DeleteReview from 'front/pages/delete-review';
import Snackbar from 'front/pages/snackbar';
import AppTheme from 'common/components/theme/theme';

type Props = {
  settings: SettingsType,
  type: 'product' | 'customer',
  id: number
};

type State = {
  fontSize: number
}

class FrontApp extends React.PureComponent<Props, State> {
  static displayName = 'FrontApp';

  state = {
    fontSize: getFontSize()
  }

  render() {
    const { settings, type, id } = this.props;
    return (
      <AppTheme htmlFontSize={this.state.fontSize}>
        { type === 'product' ? (
          <ProductReviewList settings={settings} productId={id} />
        ) : (
          <CustomertReviewList settings={settings} customerId={id} />
        )}
        <EditReview settings={settings} />
        <DeleteReview />
        <Snackbar />
      </AppTheme>
    );
  }
}

const getFontSize = () => {
  const doc = document.documentElement;
  if (doc) {
    return parseFloat(getComputedStyle(doc).fontSize);
  }
  return 10;
};

export default FrontApp;
