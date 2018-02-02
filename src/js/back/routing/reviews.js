// @flow
import type { RouteDefinition } from 'back/types';
import Reviews from 'back/pages/reviews';

export type ReviewsPage = {
  type: 'reviews',
  showNavigation: boolean
}

const toUrl = (reviews: ReviewsPage) => {
  return '/reviews';
};

const toState = (url: string): ?ReviewsPage => {
  if (url === '/reviews') {
    return reviewsPage();
  }
};

export const reviewsPage = ():ReviewsPage => ({
  type: 'reviews',
  showNavigation: true
});

export const reviewsRoute: RouteDefinition<ReviewsPage> = {
  toUrl,
  toState,
  component: Reviews
};
