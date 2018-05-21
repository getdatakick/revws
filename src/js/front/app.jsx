// @flow

import type { SettingsType, VisitorType, WidgetsType, WidgetType } from 'front/types';
import React from 'react';
import ProductReviewList from 'front/pages/product-review-list';
//import CustomertReviewList from 'front/pages/customer-review-list';
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
    if (widget.type === 'productList') {
      const { listId, productId } = widget;
      return (
        <Portal nodeId={`revws-portal-${listId}`} key={i}>
          <ProductReviewList
            settings={this.props.settings}
            visitor={this.props.visitor}
            listId={listId}
            productId={productId} />
        </Portal>
      );
    }
    /*
      <CustomertReviewList settings={settings} customerId={id} />
    */
  }
}

export default FrontApp;
