// @flow
import type {ReviewType} from "../../common/types";import type { State } from 'front/reducer';

export const getReview = (state: State): ?ReviewType => state.deleteReview.review;
