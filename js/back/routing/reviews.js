// @flow
import type { RouteDefinition } from 'back/types';
import Reviews from 'back/pages/reviews';

export type SubPage = 'list' | 'create' | 'data';

export type ReviewsPage = {
  type: 'reviews',
  subpage: SubPage,
  showNavigation: boolean,
}

const toUrl = (reviews: ReviewsPage) => {
  let url = '/reviews';
  if (reviews.subpage != 'list') {
    url += '/' + reviews.subpage;
  }
  return url;
};

const toState = (url: string): ?ReviewsPage => {
  if (url === '/reviews') {
    return reviewsPage();
  }
  if (url === '/reviews/create') {
    return reviewsPage('create');
  }
  if (url === '/reviews/data') {
    return reviewsPage('data');
  }
};

export const reviewsPage = (subpage: SubPage = 'list'):ReviewsPage => ({
  type: 'reviews',
  subpage,
  showNavigation: true
});

export const reviewsRoute: RouteDefinition<ReviewsPage> = {
  toUrl,
  toState,
  component: Reviews
};
