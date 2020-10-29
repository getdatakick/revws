// @flow
import type {ReviewType, EditStage} from "../../common/types";import type { State } from 'front/reducer';

export const getReview = (state: State): ?ReviewType => state.editReview.review;
export const getStage = (state: State): EditStage => state.editReview.stage;
