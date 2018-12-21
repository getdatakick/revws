// @flow

import type { SettingsType, VisitorType, WidgetsType, WidgetType } from 'front/types';
import { values } from 'ramda';
import React from 'react';
import EntityReviewList from 'front/widgets/entity-review-list';
import MyReviews from 'front/widgets/my-reviews';
import ReviewList from 'front/widgets/review-list';
import EditReview from 'front/components/edit-review';
import Portal from 'common/components/portal/portal';
import DeleteReview from 'front/components/delete-review';
import Snackbar from 'front/components/snackbar';
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
    const widgetList: Array<WidgetType> = values(widgets);
    return (
      <AppTheme fontFamily='inherit'>
        { widgetList.map(this.renderWidget) }
        <EditReview visitor={visitor} settings={settings} />
        <DeleteReview />
        <Snackbar />
      </AppTheme>
    );
  }

  renderWidget = (widget: WidgetType, i: number) => {
    const { settings, visitor } = this.props;
    if (widget.type === 'entityList') {
      const { listId, entityType, entityId, allowPaging } = widget;
      return (
        <Portal nodeId={`revws-portal-${listId}`} key={i}>
          <EntityReviewList
            settings={settings}
            visitor={visitor}
            listId={listId}
            entityType={entityType}
            entityId={entityId}
            allowPaging={allowPaging} />
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
    if (widget.type === 'list') {
      const { listId } = widget;
      return (
        <Portal nodeId={`revws-portal-${listId}`} key={i}>
          <ReviewList
            widget={widget}
            settings={settings}
            listId={listId} />
        </Portal>
      );
    }
  }
}

export default FrontApp;
