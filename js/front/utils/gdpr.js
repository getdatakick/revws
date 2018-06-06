// @flow
import type { ReviewType } from 'common/types';
import type { SettingsType } from 'front/types';

export const consentRequired = (settings: SettingsType, review: ReviewType) => {
  if (settings.gdpr.active) {
    return review.id === -1;
  }
  return false;
};
