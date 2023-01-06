// @flow

import type { Api } from 'common/types.js';
import type { UploadImageAction } from 'front/actions/index.js';
import { setSnackbar, setImage, uploadImageFailed } from 'front/actions/creators.js';

export const uploadImage = (action: UploadImageAction, store: any, api: Api) => {
  api('uploadImage', { file: action.file }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setImage(action.id, result.data));
    } else {
      store.dispatch(setSnackbar(__('Failed to upload file: %s', result.error)));
      store.dispatch(uploadImageFailed(action.id));
    }
  });
};
