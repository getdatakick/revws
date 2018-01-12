// @flow
import React from 'react';
import type { ReviewType, SettingsType } from 'types';
import { reduce, add, values } from 'ramda';
import moment from 'moment';
import Grading from 'components/grading/grading';

type Props = {
  settings: SettingsType,
  review: ReviewType,
  onEdit: (ReviewType)=>void,
  onDelete: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
  onReport: (ReviewType)=>void
};

class ReviewListItem extends React.PureComponent<Props> {
  static displayName = 'ReviewListItem';

  render() {
    const { onReport, onEdit, onDelete, onVote, review, settings } = this.props;
    const { displayName, date, title, underReview, content, canVote, canReport, canEdit, canDelete, grades } = review;
    return (
      <div className="revws-review row no-gutter">
        <div className="col-sm-3 col-md-2">
          <div className="revws-review-author">
            <div className="revws-review-author-name">{ displayName }</div>
            <Grading
              grade={averageGrade(grades)}
              shape={settings.shape}
              size={settings.shapeSize.product}
            />
            <div className="revws-review-date">{formatDate(date)}</div>
          </div>
        </div>

        <div className="col-sm-9 col-md-10">
          <div className="revws-review-details">
            <p className="revws-review-title">
              { title }
            </p>
            {underReview && (
              <div className="revws-under-review">{"This review hasn't been approved yet"}</div>
            )}
            <p className="revws-review-content">{ this.renderContent(content) }</p>
            <div className="revws-actions">
              {canVote && (
                <div className="revws-action revws-useful">
                  {'Was this comment useful to you?'}
                  <a className="btn btn-xs btn-link" onClick={() => onVote(review, 'up')}>
                    <i className="icon icon-thumbs-up"></i> {'Yes'}
                  </a>
                  <a className="btn btn-xs btn-link" onClick={() => onVote(review, 'down')}>
                    <i className="icon icon-thumbs-down"></i> {'No'}
                  </a>
                </div>
              )}
              {canReport && (
                <div className="revws-action revws-report">
                  <a className="btn btn-xs btn-link" onClick={() => onReport(review)}>
                    <i className="icon icon-flag"></i> {'Report abuse'}
                  </a>
                </div>
              )}
              {canEdit && (
                <div className="revws-action revws-edit">
                  <a className="btn btn-xs btn-link" onClick={() => onEdit(review)}>
                    <i className="icon icon-edit"></i> {'Edit review'}
                  </a>
                </div>
              )}
              {canDelete && (
                <div className="revws-action revws-delete">
                  <a className="btn btn-xs btn-link" onClick={() => onDelete(review)}>
                    <i className="icon icon-remove"></i> {'Delete review'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderContent = (content: ?string) => {
    if (! content) {
      return null;
    }
    const split = content.split(/\r?\n/);
    const cnt = split.length;
    if (cnt <= 1) {
      return content;
    }
    const ret = [];
    for (var i=0; i<cnt; i++) {
      const item = split[i];
      ret.push(<span key={i}>{item}</span>);
      if (i != cnt-1) {
        ret.push(<br key={'br-'+i} />);
      }
    }
    return ret;
  }
}

const formatDate = (date: Date): string => {
  return moment(date).format('MM/DD/YYYY');
};

const averageGrade = (grades): number => {
  const vals = values(grades);
  const cnt = vals.length;
  if (cnt) {
    const sum = reduce(add, 0, vals);
    return sum / cnt;
  }
  return 0;
};

export default ReviewListItem;
