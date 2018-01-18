// @flow
import { path } from 'ramda';

const get = (key: string) => path(['reviewList', key]);
export const getReviews = get('list');
export const isLoading = get('loading');
