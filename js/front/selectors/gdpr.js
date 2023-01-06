// @flow
import type { State } from 'front/reducer/index.js';

export const hasAgreed = (state: State): boolean => state.gdpr.agreed;
