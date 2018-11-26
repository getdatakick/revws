// @flow
import type { NameFormatType, LangString, LanguagesType, GradingShapeType, ShapeColorsType, DisplayCriteriaType, EntityType } from 'common/types';
export type { RoutingState, GoTo } from 'back/routing';

export type SettingsType = {
  general: {
    multilang: boolean
  },
  theme: {
    shape: string,
    colors: ShapeColorsType,
    shapeSize: {
      product: number,
      list: number,
      create: number,
    }
  },
  display: {
    product: {
      placement: string,
      orderBy: 'date' | 'grade' | 'usefulness',
      reviewsPerPage: number | string,
      averagePlacement: 'rightColumn' | 'buttons' | 'custom' | 'none',
      showSignInButton: boolean,
    },
    productList: {
      show: boolean,
      noReviews: 'show' | 'hide' | 'omit'
    },
    productComparison: {
      show: boolean,
    },
    myReviews: {
      show: boolean,
      iconClass: string,
      reviewsPerPage: number | string,
      maxRequests: number | string,
    }
  },
  moderation: {
    enabled: boolean,
    needApprove: {
      create: boolean,
      edit: boolean,
      reported: boolean
    }
  },
  review: {
    displayName: NameFormatType,
    allowGuestReviews: boolean,
    allowEmpty: boolean,
    allowVoting: boolean,
    allowReporting: boolean,
    allowDelete: boolean,
    allowEdit: boolean,
    displayCriteria: DisplayCriteriaType
  },
  images: {
    enabled: boolean,
    allowNewImages: boolean,
    maxFileSize: number | string,
    width: number | string,
    height: number | string,
    thumbWidth: number | string,
    thumbHeight: number | string,
  },
  notifications: {
    admin: {
      email: string,
      language: number | string,
      reviewCreated: boolean,
      reviewUpdated: boolean,
      reviewDeleted: boolean,
      needApprove: boolean,
    },
    author: {
      thankYou: boolean,
      reviewApproved: boolean,
      reviewDeleted: boolean,
      reply: boolean,
    }
  },
  richSnippets: {
    enabled: boolean
  },
  gdpr: {
    implementation: 'none' | 'basic' | 'psgdpr',
    requiredForCustomers: boolean
  }
}

export type EnvironmentType = {
  productcomments: boolean,
  krona: boolean,
  psgdpr: boolean
}

export type GlobalDataType = {
  activated: boolean,
  version: string,
  versionUrl: string,
  api: string,
  shopName: string,
  baseUrl: string,
  shapes: {
    [ string ]: GradingShapeType
  },
  dateFormat: string,
  language: number,
  languages: LanguagesType,
  platform: 'thirtybees' | 'prestashop',
  platformVersion: string,
  environment: EnvironmentType,
  drilldownUrls: DrilldownUrls,
  entityTypes: {
    [ EntityType ]: string
  },
  warnings?: Array<WarningMessageType>
}

export type FullCriterion = {
  id: number,
  active: boolean,
  global: boolean,
  label: LangString,
  entityType: EntityType,
  products: Array<number>,
  categories: Array<number>
}

export type FullCriteria = {
  [ number ]: FullCriterion
}

// route definition
export type RouteDefinition<T> = {
  toUrl: (T) => string,
  toState: (string) => ?T,
  component: any,
  setup?: (T, any)=>void,
  update?: (T, T, any)=>void,
  teardown?: (T, any)=>void
};

export type LoadPagination = {
  pageSize: number,
  page: number
}

export type LoadCustomers = {
  record: 'customers'
}

export type LoadCategories = {
  record: 'categories'
}

export type LoadReviews = {
  record: 'reviews',
  pagination: LoadPagination
};

export type LoadEntities = {
  record: 'entities',
  entityType: EntityType
}

export type LoadEntity = {
  record: 'entity',
  entityType: EntityType,
  entityId: number
}

export type Load = LoadCategories | LoadCustomers | LoadReviews | LoadEntities | LoadEntity;

export type VersionCheck = {
  version: ?string,
  ts: ?number,
  notes?: ?string,
  paid?: ?string,
}

export type AccountType = {
  activated: boolean,
  version: string,
  versionCheck: VersionCheck
}

export type WarningMessageIconType = (
  'email' |
  'warning'
);

export type WarningMessageType = {
  icon: WarningMessageIconType,
  message: string,
  hint: string
};


export type EmailPreferences = {
  release: boolean,
  education: boolean,
  marketing: boolean
}

export type DrilldownUrls = {
  [ string ] : string
};
