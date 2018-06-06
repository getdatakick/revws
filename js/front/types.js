// @flow

import type { ReviewType, CriteriaType, DisplayCriteriaType, GradingShapeType, NameFormatType, ProductInfoType, ListOrder, ListOrderDirection } from 'common/types';

export type ReviewDisplayStyle = 'item' | 'item-with-product';

export type SettingsType = {
  csrf: string,
  shopName: string,
  api: string,
  criteria: CriteriaType,
  shape: GradingShapeType,
  shapeSize: {
    product: number,
    list: number,
    create: number
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
    text: string
  },
  loginUrl: string
}

export type VisitorType = {
  type: 'customer' | 'guest',
  id: number,
  language: number,
  firstName: ?string,
  lastName: ?string,
  pseudonym: ?string,
  nameFormat: NameFormatType,
  email: string,
  reviewedProducts: Array<number>,
  productsToReview: Array<number>
};

export type EntitiesType = {
  products: {
    [ number ]: ProductInfoType
  }
}

export type ListConditions = {
  product?: number,
  customer?: number
}

export type ListType = {
  id: string,
  pageSize: number,
  page: number,
  pages: number,
  total: number,
  order: ListOrder,
  orderDir: ListOrderDirection,
  conditions: ListConditions,
  reviews: Array<number>
}

export type ListsType = {
  [ string ]: ListType
}

export type ReviewsType = {
  [ number ]: ReviewType
};

export type TranslationsType = {
  [ string ]: string
};

export type ProductListWidgetType = {
  type: 'productList',
  productId: number,
  listId: string
}

export type MyReviewsWidgetType = {
  type: 'myReviews',
  listId: string
}

export type CustomListWidgetType = {
  type: 'list',
  listId: string,
  reviewStyle: ReviewDisplayStyle,
  displayReply: boolean,
  displayCriteria: DisplayCriteriaType,
  allowPaging: boolean
}

export type WidgetType = (
  ProductListWidgetType |
  MyReviewsWidgetType |
  CustomListWidgetType
);

export type WidgetsType = Array<WidgetType>;

export type InitDataType = {
  translations: TranslationsType,
  settings: SettingsType,
  visitor: VisitorType,
  entities: EntitiesType,
  lists: ListsType,
  reviews: ReviewsType,
  widgets: WidgetsType,
  initActions: Array<any>
}
