// @flow

import type { CriteriaType, GradingShapeType, NameFormatType } from 'common/types';

export type SettingsType = {
  api: string,
  criteria: CriteriaType,
  shape: GradingShapeType,
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
    nameFormat: NameFormatType,
    email: string,
  },
  preferences: {
    allowEmptyReviews: boolean,
    allowGuestReviews: boolean,
    allowReviewWithoutCriteria: boolean,
    customerReviewsPerPage: number,
    customerMaxRequests: number
  },
  canCreate: boolean
}

export type ProductInfoType = {
  id: number,
  name: string,
  url: string,
  image: string,
  criteria: Array<number>,
  canCreate: boolean
}
