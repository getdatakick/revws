// @flow

import type { SettingsType, VisitorType, WidgetsType, WidgetType } from 'front/types';
import React from 'react';
import ProductReviewList from 'front/pages/product-review-list';
import MyReviews from 'front/pages/my-reviews';
import EditReview from 'front/pages/edit-review';
import Portal from 'common/components/portal/portal';
import DeleteReview from 'front/pages/delete-review';
import Snackbar from 'front/pages/snackbar';
import AppTheme from 'common/components/theme/theme';

type Props = {
  settings: SettingsType,
  visitor: VisitorType,
  widgets: WidgetsType
};

class FrontApp extends React.PureComponent<Props> {
  static displayName = 'FrontApp';

  render() {
    const { settings, visitor, widgets } = this.props;
    return (
      <AppTheme>
        { widgets.map(this.renderWidget) }
        <EditReview visitor={visitor} settings={settings} />
        <DeleteReview />
        <Snackbar />
      </AppTheme>
    );
  }

  renderWidget = (widget: WidgetType, i: number) => {
    const { settings, visitor } = this.props;
    if (widget.type === 'productList') {
      const { listId, productId } = widget;
      return (
        <Portal nodeId={`revws-portal-${listId}`} key={i}>
          <ProductReviewList
            settings={settings}
            visitor={visitor}
            listId={listId}
            productId={productId} />
        </Portal>
      );
    }
    if (widget.type === 'myReviews' && visitor.type === 'customer') {
      const { listId } = widget;
      return (
        <Portal nodeId={`revws-portal-${listId}`} key={i}>
          <MyReviews
            settings={settings}
            listId={listId}
            customerId={visitor.id} />
        </Portal>
      );
    }
  }
}

export default FrontApp;
