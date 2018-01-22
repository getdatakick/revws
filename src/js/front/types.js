// @flow

import type { CriteriaType, GradingShapeType, NameFormatType } from 'common/types';

export type SettingsType = {
  api: string,
  criteria: CriteriaType,
  shape: GradingShapeType,
  product: ProductInfoType,
  shapeSize: {
    product: number,
    list: number,
    create: number
  },
  visitor: {
    type: 'customer' | 'guest',
    firstName: ?string,
    lastName: ?string,
    nameFormat: NameFormatType,
    email: string,
  },
  permissions: {
    create: boolean
  },
  preferences: {
    allowEmptyReviews: boolean,
    allowReviewWithoutCriteria: boolean
  }
}

export type ProductInfoType = {
  id: number,
  name: string,
  url: string,
  image: string,
  criteria: Array<number>
}
