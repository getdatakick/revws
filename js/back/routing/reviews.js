// @flow
import type { RouteDefinition } from 'back/types';
import Reviews from 'back/pages/reviews';

export type ReviewsPage = {
  type: 'reviews',
  createReview: boolean,
  showNavigation: boolean,
}

const toUrl = (reviews: ReviewsPage) => {
  let url = '/reviews';
  if (reviews.createReview) {
    url += '/create';
  }
  return url;
};

const toState = (url: string): ?ReviewsPage => {
  if (url === '/reviews') {
    return reviewsPage();
  }
  if (url === '/reviews/create') {
    return reviewsPage(true);
  }
};

export const reviewsPage = (createReview?:boolean):ReviewsPage => ({
  type: 'reviews',
  createReview: !!createReview,
  showNavigation: true
});

export const reviewsRoute: RouteDefinition<ReviewsPage> = {
  toUrl,
  toState,
  component: Reviews
};
