// @flow
import type { ReviewType } from 'common/types.js';
import type { SettingsType } from 'front/types.js';

export const consentRequired = (settings: SettingsType, review: ReviewType): boolean => {
  if (settings.gdpr.active) {
    return review.id === -1;
  }
  return false;
};
