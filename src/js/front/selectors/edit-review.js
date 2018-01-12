// @flow
import { path } from 'ramda';

const get = (key: string) => path(['editReview', key]);

export const getReview = get('review');
export const getStage = get('stage');
