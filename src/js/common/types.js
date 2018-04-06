// @flow

export type KeyValue = {
  [ number ]: string
}

export type LanguagesType = {
  [ number ]: {
    code: string,
    name: string
  }
}

export type LangString = KeyValue;

export type Success = {
  type: 'success',
  data: any
}

export type Failure = {
  type: 'failed',
  error: string
}

export type ResponseType = Failure | Success;

export type Api = (cmd: string, payload:{}) => Promise<ResponseType>;

export type Command = (any, any, Api) => void;

export type GradingShapeType = {
  path: string,
  viewBox: string,
  strokeWidth: number
}

export type GradingType = {
  [ number ]: number
};

export type ReviewType = {
  id: number,
  productId: number,
  product: ?string,
  customer: ?string,
  authorType: 'guest' | 'customer',
  authorId: number,
  displayName: string,
  email: string,
  title: string,
  content: ?string,
  reply: ?string,
  grades: GradingType,
  date: Date,
  underReview: boolean,
  deleted: boolean,
  verifiedBuyer: boolean,
  canVote: boolean,
  canEdit: boolean,
  canDelete: boolean,
  canReport: boolean
}

export type ReviewListType = {
  pageSize: number,
  page: number,
  pages: number,
  total: number,
  reviews: Array<ReviewType>
}

export type ReviewFormErrors = {
  email: ?string,
  displayName: ?string,
  title: ?string,
  content: ?string
}

export type CriterionType = {
  id: number,
  label: string
}

export type CriteriaType = {
  [ number ] : CriterionType
}

export type EditStage = 'edit' | 'saving' | 'saved' | 'failed';

export type NameFormatType = 'fullName' | 'firstName' | 'lastName' | 'initials' | 'initialLastName' | 'pseudonym' | 'custom';

export type ProductInfoType = {
  id: number,
  name: string,
  url: string,
  image: string,
  criteria: Array<number>,
  canCreate: boolean
}


export type CustomerInfoType = {
  id: number,
  firstName: string,
  lastName: string,
  pseudonym: ?string,
  email: string,
}

export type ShapeColorsType = {
  fillColor: string,
  borderColor: string,
  fillColorOff: string,
  borderColorOff: string
}

export type DisplayCriteriaType = 'none' | 'inline' | 'side';
