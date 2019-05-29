// @flow

import React from 'react';
import debounce from 'debounce';
import classnames from 'classnames';
import type { DisplayCriteriaType, GradingShapeType, ReviewType, ShapeColorsType, CriteriaType } from 'common/types';
import { F, isNil, sortBy, prop, values, filter, has } from 'ramda';
import { hasRatings, averageGrade } from 'common/utils/reviews';
import Grading from 'common/components/grading/grading';
import ReplyIcon from 'material-ui-icons/Reply';
import styles from './review-list-item.less';
import Textarea from 'common/components/text-area/text-area';
import InlineCriteria from 'common/components/criteria/inline';
import BlockCriteria from 'common/components/criteria/block';
import Button from 'material-ui/Button';
import formatDate from 'locutus/php/datetime/date';

type Props = {
  shopName: string,
  shape: GradingShapeType,
  colors?: ShapeColorsType,
  dateFormat: string,
  shapeSize: number,
  criteria: CriteriaType,
  displayCriteria: DisplayCriteriaType,
  displayReply: boolean,
  review: ReviewType,
  onEdit: (ReviewType)=>void,
  onSaveReply?: (?string)=>void,
  onDelete: (ReviewType)=>void,
  onVote: (ReviewType, 'up' | 'down')=>void,
  onReport: (ReviewType)=>void
};

type State = {
  editReply: ?string
}

class ReviewListItem extends React.PureComponent<Props, State> {
  static displayName = 'ReviewListItem';

  static defaultProps = {
    displayReply: true,
    onEdit: F,
    onDelete: F,
    onVote: F,
    onReport: F
  }

  state = {
    editReply: null
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.state.editReply && this.props.review.reply != nextProps.review.reply) {
      this.stopEditReply();
    }
  }

  componentDidMount() {
    if (window.$) {
      const $ = window.$;
      if ($.fancybox) {
        $('[data-revws-image-group="'+this.props.review.id+'"]').fancybox();
      }
    }
  }

  render() {
    const { colors, shape, shapeSize, onReport, onEdit, onDelete, onVote, review, criteria, displayCriteria, dateFormat } = this.props;
    const { displayName, date, title, underReview, verifiedBuyer, content, canVote, canReport, grades, canEdit, canDelete, loading } = review;
    const classes = classnames('revws-review', {
      'revws-review-under-review': underReview,
      'revws-verified-buyer': verifiedBuyer
    });

    const crits = displayCriteria == 'none' ? [] : getCriteriaToRender(criteria, grades);
    const showCriteria = crits.length > 1;
    let stars = undefined;

    if (hasRatings(review)) {
      stars = (
        <Grading
          grade={averageGrade(review)}
          shape={shape}
          type={'product'}
          size={shapeSize}
          colors={colors} />
      );
    }

    return (
      <div className={classes}>
        { loading  && <div className="revws-loading" /> }
        <div className="revws-review-author">
          <div className="revws-review-author-name">{ displayName }</div>
          {verifiedBuyer && <div className="revws-verified-buyer-badge">{__("Verified purchase")}</div>}
          {stars}
          <div className="revws-review-date">{formatDate(dateFormat, date)}</div>
        </div>

        <div className="revws-review-details">
          <div className="revws-review-review">
            <div className="revws-review-box">
              {showCriteria && displayCriteria == 'inline' && (
                <InlineCriteria
                  grades={review.grades}
                  shape={shape}
                  shapeSize={shapeSize}
                  colors={colors}
                  criteria={crits} />
              )}
              {title && (
                <p className="revws-review-title">{ title }</p>
              )}
              {underReview && (
                <div className="revws-under-review">{__("This review hasn't been approved yet")}</div>
              )}
              {content && (
                <p className="revws-review-content">{ this.renderContent(content) }</p>
              )}
              {!title && !content && (
                <p className="revws-review-content revws-review-without-details">
                  {__("Customer didn't write any details")}
                </p>
              )}
            </div>
            {showCriteria && displayCriteria == 'side' && (
              <BlockCriteria
                grades={review.grades}
                shape={shape}
                shapeSize={shapeSize}
                colors={colors}
                criteria={crits} />
            )}
          </div>
          { this.renderImages() }
          <div className="revws-actions">
            {canVote && (
              <div className="revws-action revws-useful">
                {__('Was this comment useful to you?')}
                <a className="btn btn-xs btn-link" onClick={() => onVote(review, 'up')}>
                  <i className="icon icon-thumbs-up"></i> {__('Yes')}
                </a>
                <a className="btn btn-xs btn-link" onClick={() => onVote(review, 'down')}>
                  <i className="icon icon-thumbs-down"></i> {__('No')}
                </a>
              </div>
            )}
            {canReport && (
              <div className="revws-action revws-report">
                <a className="btn btn-xs btn-link" onClick={() => onReport(review)}>
                  <i className="icon icon-flag"></i> {__('Report abuse')}
                </a>
              </div>
            )}
            {canEdit && (
              <div className="revws-action revws-edit">
                <a className="btn btn-xs btn-link" onClick={() => onEdit(review)}>
                  <i className="icon icon-edit"></i> {__('Edit review')}
                </a>
              </div>
            )}
            {canDelete && (
              <div className="revws-action revws-delete">
                <a className="btn btn-xs btn-link" onClick={() => onDelete(review)}>
                  <i className="icon icon-remove"></i> {__('Delete review')}
                </a>
              </div>
            )}
          </div>
          { this.renderReplies() }
        </div>
      </div>
    );
  }

  renderImages = () => {
    const { images } = this.props.review;
    if (!images || !images.length) {
      return null;
    }
    return (
      <div className="revws-images">
        { images.map(this.renderImage) }
      </div>
    );
  }

  renderImage = (image: string) => (
    <a key={image} data-revws-image-group={this.props.review.id} rel='1' href={image}>
      <div className="revws-image">
        <img src={getThumbnail(image)} />
      </div>
    </a>
  );

  renderReplies = () => {
    const { displayReply, review, onSaveReply } = this.props;
    const { editReply } = this.state;
    if (! isNil(editReply)) {
      return this.renderEditReply(editReply || '');
    }
    if (review.reply) {
      return displayReply && this.renderReply(review.reply);
    }
    if (onSaveReply) {
      return this.renderReplyPlaceholder();
    }
    return null;
  }

  renderReply = (reply: string) => {
    const shopName = this.props.shopName;
    const canEdit = !!this.props.onSaveReply;
    const clazz = classnames("revws-reply", {
      [ styles.editable ]: canEdit
    });
    const onClick = canEdit ? this.startEditReply : null;
    return (
      <div className="revws-replies">
        <div className={clazz} onClick={onClick}>
          <div className="revws-reply-title">
            {__('Reply from %s:', shopName)}
          </div>
          <div className="revws-reply-content">
            { this.renderContent(reply) }
          </div>
        </div>
      </div>
    );
  }

  renderEditReply = (reply: string) => {
    return (
      <div className="revws-replies">
        <Textarea
          value={reply}
          label={__('Your answer')}
          placeholder={__('Write your answer')}
          onChange={e => this.setState({ editReply: e.target.value })} />
        <div className={styles.margin}>
          <Button onClick={this.stopEditReply}>
            {__('Cancel')}
          </Button>
          <Button color='accent' onClick={debounce(this.saveReply, 300, true)}>
            {__('Save')}
          </Button>
        </div>
      </div>
    );
  }

  renderReplyPlaceholder = () => {
    return (
      <div className="revws-replies">
        <div className={styles.reply} onClick={this.startEditReply}>
          <ReplyIcon />
          {__('Click here to reply')}
        </div>
      </div>
    );
  }

  startEditReply = () => {
    const review = this.props.review;
    this.setState({ editReply: review.reply || '' });
  }

  stopEditReply = () => {
    this.setState({ editReply: null });
  }

  saveReply = () => {
    const { onSaveReply } = this.props;
    if (onSaveReply) {
      const reply = this.state.editReply || null;
      this.stopEditReply();
      onSaveReply(reply);
    }
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

const getCriteriaToRender = (criteria, grades) => {
  const list = sortBy(prop('id'), values(criteria));
  return filter(crit => has(crit.id, grades), list);
};

const getThumbnail = (img: string) => img.replace(/.jpg$/, ".thumb.jpg");


export default ReviewListItem;
