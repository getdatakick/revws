// @flow

import type {Node} from 'react';
import type { SettingsType, VisitorType, WidgetsType, WidgetType } from 'front/types.js';
import { values } from 'ramda';
import React from 'react';
import EntityReviewList from 'front/widgets/entity-review-list/index.js';
import MyReviews from 'front/widgets/my-reviews';
import ReviewList from 'front/widgets/review-list/index.js';
import EditReview from 'front/components/edit-review/index.js';
import Portal from 'common/components/portal/portal.jsx';
import DeleteReview from 'front/components/delete-review/index.js';
import Snackbar from 'front/components/snackbar/index.js';
import AppTheme from 'common/components/theme/theme.jsx';

type Props = {
  settings: SettingsType,
  visitor: VisitorType,
  widgets: WidgetsType
};

class FrontApp extends React.PureComponent<Props> {
  static displayName: ?string = 'FrontApp.js';

  render(): Node {
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

  renderWidget: ((widget: WidgetType, i: number) => void | Node) = (widget: WidgetType, i: number) => {
    const { settings, visitor } = this.props;
    if (widget.type === 'entityList') {
      const { listId, entityType, entityId, allowPaging, microdata } = widget;
      return (
        <Portal nodeId={`revws-portal-${listId}`} key={i}>
          <EntityReviewList
            settings={settings}
            visitor={visitor}
            listId={listId}
            entityType={entityType}
            entityId={entityId}
            displayMicrodata={microdata}
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
