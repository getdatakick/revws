// @flow
import type {ReviewType, EditStage} from "common/types";
import type { State } from 'front/reducer/index.js';

export const getReview = (state: State): ?ReviewType => state.editReview.review;
export const getStage = (state: State): EditStage => state.editReview.stage;
