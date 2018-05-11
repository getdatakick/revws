// @flow

import type { CriteriaType, DisplayCriteriaType, GradingShapeType, NameFormatType, ProductInfoType } from 'common/types';

export type SettingsType = {
  csrf: string,
  shopName: string,
  api: string,
  criteria: CriteriaType,
  shape: GradingShapeType,
  language: number,
  products: {
    [ number ]: ProductInfoType
  },
  shapeSize: {
    product: number,
    list: number,
    create: number
  },
  visitor: {
    type: 'customer' | 'guest',
    id: number,
    firstName: ?string,
    lastName: ?string,
    pseudonym: ?string,
    nameFormat: NameFormatType,
    email: string,
  },
  preferences: {
    allowEmptyReviews: boolean,
    allowGuestReviews: boolean,
    allowReviewWithoutCriteria: boolean,
    customerReviewsPerPage: number,
    customerMaxRequests: number,
    showSignInButton: boolean,
    displayCriteria: DisplayCriteriaType
  },
  gdpr: {
    active: boolean,
    needConsent: boolean,
    text: string
  },
  loginUrl: string,
  canCreate: boolean
}
