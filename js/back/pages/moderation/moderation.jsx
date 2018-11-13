// @flow

import type { SettingsType, GlobalDataType } from 'back/types';
import type { CriteriaType } from 'common/types';
import React from 'react';
import ReviewsTable from 'back/components/reviews-table';

export type Props = {
  data: GlobalDataType,
  settings: SettingsType,
  criteria: CriteriaType
};

class ModerationPage extends React.PureComponent<Props> {
  static displayName = 'ModerationPage';

  render() {
    const { settings, data, criteria } = this.props;
    const shape = data.shapes[settings.theme.shape];
    return (
      <ReviewsTable
        shopName={data.shopName}
        language={data.language}
        languages={data.languages}
        title={__('Unapproved reviews')}
        emptyLabel={__('Nothing to approve')}
        shape={shape}
        shapeSize={settings.theme.shapeSize.product}
        dateFormat={data.dateFormat}
        displayCriteria={settings.review.displayCriteria}
        criteria={criteria}
        filters={{
          validated: false,
          deleted: false
        }}
        drilldownUrls={data.drilldownUrls}
        entityTypes={data.entityTypes}
        uniqueId='toApprove' />
    );
  }
}

export default ModerationPage;
