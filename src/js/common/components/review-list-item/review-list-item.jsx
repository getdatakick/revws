// @flow
import React from 'react';
import type { GradingShapeType, ReviewType } from 'common/types';
import { hasRatings, averageGrade } from 'common/utils/reviews';
import Grading from 'common/components/grading/grading';

type Props = {
  shape: GradingShapeType,
  shapeSize: number,
  review: ReviewType,
  onEdit: (ReviewType)=>void,
  onDelete: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
  onReport: (ReviewType)=>void
};

class ReviewListItem extends React.PureComponent<Props> {
  static displayName = 'ReviewListItem';

  render() {
    const { shape, shapeSize, onReport, onEdit, onDelete, onVote, review } = this.props;
    const { displayName, date, title, underReview, content, canVote, canReport, canEdit, canDelete } = review;
    return (
      <div className="revws-review row no-gutter">
        <div className="col-sm-3 col-md-2">
          <div className="revws-review-author">
            <div className="revws-review-author-name">{ displayName }</div>
            { hasRatings(review) ? (
              <Grading
                grade={averageGrade(review)}
                shape={shape}
                size={shapeSize}
              />
            ) : undefined}
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
  var month = pad(date.getMonth()+1);
  var day = pad(date.getDate());
  var year = date.getFullYear();
  return month + "/" + day + "/" + year;
};

const pad = (value) => ('00'+value).substr(-2);

export default ReviewListItem;
