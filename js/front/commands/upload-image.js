// @flow

import type { Api } from 'common/types';
import type { UploadImageAction } from 'front/actions';
import { setSnackbar, setImage, uploadImageFailed } from 'front/actions/creators';

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
