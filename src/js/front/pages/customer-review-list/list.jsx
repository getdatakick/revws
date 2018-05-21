// @flow
import React from 'react';
import type { ReviewListType, ReviewType } from 'common/types';
import type { SettingsType, EntitiesType } from 'front/types';
import ReviewListItem from 'common/components/review-list-item/review-list-item';
import { CircularProgress } from 'material-ui/Progress';
import { getProduct } from 'front/utils/entities';
import { map, F } from 'ramda';

type Props = {
  reviewList: ReviewListType,
  settings: SettingsType,
  entities: EntitiesType,
  loading: boolean,
  onEdit: (ReviewType)=>void,
  onDelete: (ReviewType)=>void,
};

class CustomerReviewList extends React.PureComponent<Props> {
  static displayName = 'CustomerReviewList';

  render() {
    const { loading, reviewList } = this.props;
    return (
      <div className="revws-review-list">
        { map(this.renderReview, reviewList.reviews) }
        { loading && [
          <div key="loading" className="revws-loading" />,
          <div key="loading-spinner" className="revws-loading-spinner">
            <CircularProgress size={100} />
          </div>
        ]}
      </div>
    );
  }

  renderReview = (review: ReviewType) => {
    const { settings, onEdit, onDelete, entities } = this.props;
    const product = getProduct(entities, review.productId);
    return (
      <div key={review.id} className="revws-review-with-product">
        <div>
          <a href={product.url}>
            <img src={product.image} alt={product.name} />
          </a>
        </div>
        <div className='revws-review-wrapper'>
          <h2><a href={product.url}>{product.name}</a></h2>
          <ReviewListItem
            shopName={settings.shopName}
            shape={settings.shape}
            shapeSize={settings.shapeSize.product}
            criteria={settings.criteria}
            displayCriteria={settings.preferences.displayCriteria}
            review={review}
            onEdit={onEdit}
            onDelete={onDelete}
            onVote={F}
            onReport={F}
          />
        </div>
      </div>
    );
  }
}

export default CustomerReviewList;
