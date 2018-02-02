// @flow

import type { SettingsType, GlobalDataType } from 'back/types';
import type { CriteriaType } from 'common/types';
import React from 'react';
import ReviewsTable from 'back/components/reviews-table';

type Props = {
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
        language={data.language}
        title={'All reviews'}
        emptyLabel={'No reviews'}
        shape={shape}
        shapeSize={settings.theme.shapeSize.product}
        criteria={criteria}
        filters={{}}
        uniqueId={'allReviews'} />
    );
  }
}

export default ModerationPage;
