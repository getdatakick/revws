// @flow
import type { State } from 'front/reducer';

export const getReview = (state: State) => state.editReview.review;
export const getStage = (state: State) => state.editReview.stage;
