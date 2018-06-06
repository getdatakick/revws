// @flow
import { path } from 'ramda';
const get = (key: string) => path(['visitorReviews', key]);

export const getProductsToReview = get('toReview');
export const getReviewedProducts = get('reviewed');
