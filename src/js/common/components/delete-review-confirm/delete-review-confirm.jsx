// @flow

import React from 'react';
import type { ComponentType } from 'react';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, withMobileDialog } from 'material-ui/Dialog';
import Question from 'material-ui-icons/HelpOutline';
import styles from './delete-review-confirm.less';

type InputProps = {
  reviewId: ?number,
  onConfirm: (number)=>void,
  onClose: ()=>void
}

type Props = InputProps & {
  fullScreen: boolean
}

class DeleteReviewConfirm extends React.PureComponent<Props> {
  static displayName = 'DeleteReviewConfirm';

  render() {
    const { onClose, reviewId, fullScreen } = this.props;
    return (
      <Dialog
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth='md'
        open={!! reviewId}
        onClose={onClose} >
        <DialogContent>
          <div className={styles.single}>
            <h2>Are you sure you want to delete this review?</h2>
            <Question style={{width: 120, height: 120}} color='error' />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={this.onDelete} color="accent">
            Delete review
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  onDelete = () => {
    const { onConfirm, reviewId } = this.props;
    if (reviewId) {
      onConfirm(reviewId);
    }
  }
}

const makeResponsive = withMobileDialog({
  breakpoint: 'xs'
});

const Responsive: ComponentType<InputProps> = makeResponsive(DeleteReviewConfirm);

export default Responsive;
