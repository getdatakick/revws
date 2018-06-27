// @flow

import type { GoTo, SettingsType, GlobalDataType } from 'back/types';
import type { CriteriaType, ReviewType } from 'common/types';
import React from 'react';
import ReviewsTable from 'back/components/reviews-table';
import CreateReview from 'back/components/create-review/create-review-dialog';
import { reviewsPage } from 'back/routing';

type Props = {
  goTo: GoTo,
  data: GlobalDataType,
  settings: SettingsType,
  criteria: CriteriaType,
  saveReview: (ReviewType) => void,
  createReview: boolean
};

class ModerationPage extends React.PureComponent<Props> {
  static displayName = 'ModerationPage';

  render() {
    const { settings, data, criteria, createReview, goTo, saveReview } = this.props;
    const shape = data.shapes[settings.theme.shape];
    const shapeSize = settings.theme.shapeSize.product;
    return (
      <div>
        <ReviewsTable
          shopName={data.shopName}
          language={data.language}
          languages={data.languages}
          title={__('All reviews')}
          emptyLabel={__('No reviews')}
          shape={shape}
          shapeSize={shapeSize}
          criteria={criteria}
          displayCriteria={settings.review.displayCriteria}
          filters={{
            deleted: false
          }}
          drilldownUrls={data.drilldownUrls}
          uniqueId='allReviews' />
        { createReview && (
          <CreateReview
            shape={shape}
            shapeSize={shapeSize}
            language={data.language}
            languages={data.languages}
            criteria={criteria}
            nameFormat={settings.review.displayName}
            allowEmptyReview={settings.review.allowEmpty}
            onClose={() => goTo(reviewsPage(false))}
            onSave={saveReview}
          />
        )}
      </div>
    );
  }
}

export default ModerationPage;
