// @flow
import { path } from 'ramda';

const get = (key: string) => path(['deleteReview', key]);
export const getReview = get('review');
