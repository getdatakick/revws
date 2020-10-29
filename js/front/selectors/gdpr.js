// @flow
import type { State } from 'front/reducer';

export const hasAgreed = (state: State): boolean => state.gdpr.agreed;
