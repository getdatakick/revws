// @flow
import { path } from 'ramda';

const get = (key: string) => path(['snackbar', key]);
export const getMessage = get('message');
