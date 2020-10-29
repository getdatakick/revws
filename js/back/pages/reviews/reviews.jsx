// @flow

import type {Element} from "React";import type { GoTo, SettingsType, GlobalDataType } from 'back/types';
import type { CriteriaType, ReviewType } from 'common/types';
import type { SubPage } from 'back/routing/reviews';
import React from 'react';
import ReviewsTable from 'back/components/reviews-table';
import CreateReview from 'back/components/create-review';
import MigrateData from './migrate-data';
import { reviewsPage } from 'back/routing';
import Section from 'back/components/section/section';
import Button from 'material-ui/Button';

export type Props = {
  goTo: GoTo,
  data: GlobalDataType,
  settings: SettingsType,
  criteria: CriteriaType,
  subpage: SubPage,
  saveReview: (ReviewType) => void,
  exportReviews: ()=>void,
};

class ReviewsPage extends React.PureComponent<Props> {
  static displayName: ?string = 'ReviewsPage';

  render(): Element<"div"> {
    const subpage = this.props.subpage;
    if (subpage === 'data') {
      return this.renderExportImport();
    } else {
      return this.renderReviewList(subpage === 'create');
    }
  }

  renderReviewList: ((createReview: boolean) => Element<"div">) = (createReview: boolean) => {
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
          showImages={true}
          entityTypes={data.entityTypes}
          drilldownUrls={data.drilldownUrls}
          uniqueId='allReviews' />
        { createReview && (
          <CreateReview
            shape={shape}
            shapeSize={shapeSize}
            entityTypes={data.entityTypes}
            language={data.language}
            languages={data.languages}
            criteria={criteria}
            nameFormat={settings.review.displayName}
            allowEmptyReview={settings.review.allowEmpty}
            allowEmptyTitle={settings.review.allowEmptyTitle}
            onClose={() => goTo(reviewsPage())}
            onSave={saveReview}
          />
        )}
      </div>
    );
  }

  renderExportImport: (() => Element<"div">) = () => {
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
