// @flow

import React from 'react';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent } from 'common/components/dialog';

type Props = {
  images: Array<string>,
  classes: any,
}

type State = {
  image: ?string
}

class ImageDialog extends React.PureComponent<Props, State> {
  static displayName = 'DeleteReviewConfirm';

  state = {
    image: null
  }

  render() {
    const { images, classes } = this.props;
    const { image } = this.state;
    if (images.length) {
      const close = this.displayImage(null);
      return (
        <div className={classes.images}>
          { images.map(img => (
            <a key={img} onClick={this.displayImage(img)}>
              <img src={img} className={classes.image}/>
            </a>
          )) }
          <Dialog
            fullScreen={false}
            fullWidth={true}
            maxWidth='md'
            open={!! image}
            onClick={prevent}
            onClose={close} >
            <DialogContent>
              <div className={classes.bigImageContainer}>
                <img src={image} className={classes.bigImage} />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={close}>
                {__('Close')}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
    }
    return null;
  }

  displayImage = (image: ?string) => (e: Event) => {
    prevent(e);
    this.setState({ image });
  }
}

const prevent = (e: Event) => {
  if (e && e.preventDefault) {
    e.preventDefault();
    e.stopPropagation();
  }
};

export default ImageDialog;
