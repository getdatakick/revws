// @flow
import type { State } from 'front/reducer';

export const hasAgreed = (state: State) => state.gdpr.agreed;
