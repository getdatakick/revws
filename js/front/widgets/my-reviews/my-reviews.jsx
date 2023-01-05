// @flow
import type {Element} from 'react';
import React from 'react';
import { F } from 'ramda';
import type { ReviewListType, ReviewType, EntityType } from 'common/types';
import type { EntitiesType, SettingsType } from 'front/types';
import { slice } from 'ramda';
import { getEntity } from 'front/utils/entities';
import List from '../review-list/review-list';

type Props = {
  entities: EntitiesType,
  productsToReview: Array<number>,
  customerId: number,
  reviewList: ReviewListType,
  settings: SettingsType,
  loading: boolean,
  loadPage: (number)=>void,
  onEdit: (ReviewType)=>void,
  onCreate: (EntityType, number)=>void,
  onDelete: (ReviewType)=>void,
};

class FrontAppCustomerReviewList extends React.PureComponent<Props> {
  static displayName: ?string = 'FrontAppCustomerReviewList';

  render(): Element<"div"> {
    return (
      <div>
        { this.renderRequests() }
        <h1 className="page-heading">{__('Your reviews')}</h1>
        { this.renderList() }
      </div>
    );
  }

  renderList: (() => Element<"div">) = () => {
    const { loadPage, settings, reviewList, loading, onEdit, onDelete, entities } = this.props;
    const isEmpty = reviewList.total === 0;
    return isEmpty ? this.renderEmptyState() : (
      <div>
        <List
          reviewStyle='item-with-entity'
          entities={entities}
          shopName={settings.shopName}
          shape={settings.shape}
          shapeSize={settings.shapeSize.product}
          dateFormat={settings.dateFormat}
          reviewList={reviewList}
          loading={loading}
          onDelete={onDelete}
          onEdit={onEdit}
          onReport={F}
          criteria={settings.criteria}
          displayCriteria={settings.preferences.displayCriteria}
          displayReply={true}
          displayMicrodata={false}
          onVote={F}
          allowPaging={true}
          loadPage={loadPage} />
      </div>
    );
  }

  renderRequests: (() => null | Element<"div">) = () => {
    const { productsToReview, settings } = this.props;
    if (productsToReview.length > 0) {
      const toReview = slice(0, settings.preferences.customerMaxRequests, productsToReview);
      return (
        <div>
          <h1 className="page-heading">{__('Could you review these products?')}</h1>
          <div className='revws-review-requests'>
            { toReview.map(this.renderRequest('product')) }
          </div>
        </div>
      );
    }
    return null;
  }

  renderRequest: ((entityType: EntityType) => (entityId: number) => void | Element<"div">) = (entityType: EntityType) => (entityId: number) => {
    const { entities, onCreate } = this.props;
    const entity = getEntity(entities, entityType, entityId);
    if (entity) {
      return (
        <div key={entityType + entityId} className='revws-review-request' onClick={e => onCreate(entityType, entityId)}>
          <img src={entity.image} />
          <h3 className='revws-review-request-name'>
            {entity.name}
          </h3>
        </div>
      );
    }
  }

  renderEmptyState: (() => Element<"div">) = () => {
    return (
      <div className="form-group">
        {__("You haven't written any review yet")}
      </div>
    );
  }
}

export default FrontAppCustomerReviewList;
