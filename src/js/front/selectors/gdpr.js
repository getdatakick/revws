// @flow
import { path } from 'ramda';

const get = (key: string) => path(['gdpr', key]);

export const hasAgreed = get('agreed');
export const needConsent = get('needConsent');
