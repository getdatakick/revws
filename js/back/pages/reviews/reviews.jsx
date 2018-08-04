// @flow

import type { GoTo, SettingsType, GlobalDataType } from 'back/types';
import type { CriteriaType, ReviewType } from 'common/types';
import type { SubPage } from 'back/routing/reviews';
import React from 'react';
import ReviewsTable from 'back/components/reviews-table';
import CreateReview from 'back/components/create-review/create-review-dialog';
import MigrateData from './migrate-data';
import { reviewsPage } from 'back/routing';
import Section from 'back/components/section/section';
import Button from 'material-ui/Button';

type Props = {
  goTo: GoTo,
  data: GlobalDataType,
  settings: SettingsType,
  criteria: CriteriaType,
  subpage: SubPage,
  saveReview: (ReviewType) => void,
  exportReviews: ()=>void,
};

class ReviewsPage extends React.PureComponent<Props> {
  static displayName = 'ReviewsPage';

  render() {
    const subpage = this.props.subpage;
    if (subpage === 'data') {
      return this.renderExportImport();
    } else {
      return this.renderReviewList(subpage === 'create');
    }
  }

  renderReviewList = (createReview: boolean) => {
    const { settings, data, criteria, goTo, saveReview } = this.props;
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
          dateFormat={data.dateFormat}
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
            onClose={() => goTo(reviewsPage())}
            onSave={saveReview}
          />
        )}
      </div>
    );
  }

  renderExportImport = () => {
    const { data, exportReviews } = this.props;
    const { baseUrl, environment } = data;
    return (
      <div>
        <Section id='import' label={__('Import data')} subheader={__('Import review data and criteria settings from other modules')}>
          <MigrateData
            environment={environment}
            baseUrl={baseUrl}
          />
        </Section>
        <Section id='export' label={__('Export data')} subheader={__('Download all your reviews data as XML file')}>
          <Button color="primary" onClick={exportReviews}>
            {__('Export reviews')}
          </Button>
        </Section>
      </div>
    );
  }
}

export default ReviewsPage;
