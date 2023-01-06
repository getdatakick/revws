// @flow
import type { ReviewType } from "common/types";
import type { State } from 'front/reducer/index.js';

export const getReview = (state: State): ?ReviewType => state.deleteReview.review;
