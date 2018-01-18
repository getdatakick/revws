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

class HomePage extends React.PureComponent<Props> {
  static displayName = 'HomePage';

  render() {
    const { settings, data, criteria } = this.props;
    const shape = data.shapes[settings.theme.shape];
    return (
      <div>
        <ReviewsTable
          language={data.language}
          title={'Unapproved reviews'}
          emptyLabel={'Nothing to approve'}
          shape={shape}
          criteria={criteria}
          filters={{
            validated: false,
            deleted: false
          }}
          uniqueId={'toApprove'} />

        <ReviewsTable
          language={data.language}
          title={'All reviews'}
          emptyLabel={'No reviews'}
          shape={shape}
          criteria={criteria}
          filters={{}}
          uniqueId={'allReviews'} />

      </div>
    );
  }
}

export default HomePage;
