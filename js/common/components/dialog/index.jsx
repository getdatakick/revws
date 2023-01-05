// @flow

import type {Node} from 'react';
import React from 'react';
import MUIDialog from 'material-ui/Dialog';
export { DialogActions, DialogContent, DialogTitle, DialogContentText, withMobileDialog } from 'material-ui/Dialog';

export default (props: any): Node => (
  <MUIDialog
    className="revws-reset"
    {...props} />
);
