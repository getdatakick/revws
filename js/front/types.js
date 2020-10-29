// @flow

import type { EntityType, ReviewType, CriteriaType, DisplayCriteriaType, GradingShapeType, NameFormatType, EntityInfoType, ListOrder, ListOrderDirection } from 'common/types';

export type ReviewDisplayStyle = 'item' | 'item-with-entity';

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
  dateFormat: string,
  preferences: {
    allowEmptyTitle: boolean,
    allowEmptyReviews: boolean,
    allowGuestReviews: boolean,
    allowImages: boolean,
    allowNewImages: boolean,
    allowReviewWithoutCriteria: boolean,
    allowMultipleReviews: boolean,
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
  reviewed: {
    [ EntityType ]: Array<number>
  },
  toReview: {
    [ EntityType ]: Array<number>
  }
};

export type EntitiesType = {
  [ EntityType ]: {
    [ number ]: EntityInfoType
  }
}

export type ListConditions = {
  product?: number,
  customer?: number
}

export type ListType = {|
  id: string,
  pageSize: number,
  page: number,
  pages: number,
  total: number,
  order: ListOrder,
  orderDir: ListOrderDirection,
  conditions: ListConditions,
  reviews: Array<number>
|}

export type ListsType = {
  [ string ]: ListType
}

export type ReviewsType = {
  [ number ]: ReviewType
};

export type TranslationsType = {
  [ string ]: string
};

export type EntityListWidgetType = {
  type: 'entityList',
  entityType: EntityType,
  entityId: number,
  listId: string,
  allowPaging: boolean,
  microdata: boolean,
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
  allowPaging: boolean,
  microdata: boolean
}

export type WidgetType = (
  EntityListWidgetType |
  MyReviewsWidgetType |
  CustomListWidgetType
);

export type WidgetsType = {
  [string]: WidgetType
};

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
