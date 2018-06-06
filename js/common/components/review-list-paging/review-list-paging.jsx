// @flow
import React from 'react';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import IconButton from 'material-ui/IconButton';

type Props = {
  page: number,
  pages: number,
  loading: boolean,
  loadPage: (number)=>void,
};

class ReviewListPaging extends React.PureComponent<Props> {
  static displayName = 'ReviewListPaging';

  render() {
    const { page, pages, loading, loadPage } = this.props;
    return (
      <div key="paging" className="revws-paging">
        <IconButton
          onClick={() => loadPage(page - 1)}
          disabled={loading || page === 0}>
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={() => loadPage(page + 1)}
          disabled={loading || page == pages - 1}>
          <KeyboardArrowRight />
        </IconButton>
      </div>
    );
  }
}

export default ReviewListPaging;
