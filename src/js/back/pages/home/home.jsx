// @flow

import type { SettingsType, GlobalDataType } from 'back/types';
import React from 'react';
import ReviewsTable from 'back/components/reviews-table';

type Props = {
  data: GlobalDataType,
  settings: SettingsType
};

class HomePage extends React.PureComponent<Props> {
  static displayName = 'HomePage';

  render() {
    const { settings, data } = this.props;
    const shape = data.shapes[settings.theme.shape];
    return (
      <div>
        <ReviewsTable
          title={'Unapproved reviews'}
          emptyLabel={'Nothing to approve'}
          shape={shape}
          filters={{
            validated: false,
            deleted: false
          }}
          uniqueId={'toApprove'} />
        <ReviewsTable
          title={'All reviews'}
          emptyLabel={'No reviews'}
          shape={shape}
          filters={{}}
          uniqueId={'allReviews'} />
      </div>
    );
  }
}

export default HomePage;
