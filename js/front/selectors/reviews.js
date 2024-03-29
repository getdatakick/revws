// @flow
import type { State as StateReviews } from "front/reducer/reviews";
import type { State } from 'front/reducer/index.js';

export const getReviews = (state: State): StateReviews => state.reviews;
