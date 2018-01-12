// @flow
import { path } from 'ramda';

const get = (key: string) => path(['reviewList', key]);
export const getReviews = get('reviews');
