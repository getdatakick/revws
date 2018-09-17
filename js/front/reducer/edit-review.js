// @flow
import type { Action } from 'front/actions';
import type { EditStage, ReviewType } from 'common/types';
import type { VisitorType } from 'front/types';
import { remove, update, append } from 'ramda';
import { formatName } from 'common/utils/format';
import Types from 'front/actions/types';

type State = {
  review: ?ReviewType,
  stage: EditStage
}

const defaultState: State = {
  review: null,
  stage: 'edit'
};

const defaultReview = (visitor: VisitorType, productId: number):ReviewType => {
  const { email, firstName, lastName, pseudonym, nameFormat, type, language} = visitor;

  return {
    id: -1,
    productId,
    authorType: type,
    authorId: -1,
    language,
    customer: null,
    product: null,
    email,
    grades: {},
    images: [],
    reply: null,
    displayName: formatName(firstName, lastName, pseudonym, nameFormat),
    title: '',
    content: null,
    underReview: true,
    deleted: false,
    date: new Date(),
    verifiedBuyer: false,
    canVote: false,
    canReport: false,
    canDelete: true,
    canEdit: true
  };
};

const setImage = (id: number, image: string, review: ReviewType) => {
  const { images, ...rest } = review;
  const newImages = (images.length <= id)
    ? append(image, images)
    : update(id, image, images);
  return { ...rest, images: newImages };
};

const removeImage = (id: number,review: ReviewType) => {
  const { images, ...rest } = review;
  const newImages = (id < images.length)
    ? remove(id, 1, images)
    : images;
  return { ...rest, images: newImages };
};

export default (visitor: VisitorType) => {
  return (state?: State, action:Action): State => {
    state = state || defaultState;

    if (action.type === Types.triggerCreateReview) {
      return {
        ...state,
        review: defaultReview(visitor, action.productId),
      };
    }

    if (action.type === Types.triggerEditReview) {
      return {
        ...state,
        review: action.review,
      };
    }

    if (action.type === Types.updateReviewDetails) {
      return { ...state, review: action.review };
    }

    if (action.type === Types.closeEditReview) {
      return defaultState;
    }

    if (action.type === Types.saveReview) {
      return { ...state, stage: 'saving' };
    }

    if (action.type === Types.saveReviewCompleted) {
      const stage = action.saved ? 'saved' : 'failed';
      return { ...state, stage };
    }

    if (action.type === Types.uploadImage && state.review) {
      const review = setImage(action.id, '', state.review);
      return { ...state, review };
    }

    if (action.type === Types.uploadImageFailed && state.review) {
      const review = removeImage(action.id, state.review);
      return { ...state, review };
    }

    if (action.type === Types.setImage && state.review) {
      const review = setImage(action.id, action.image, state.review);
      return { ...state, review };
    }

    return state;
  };
};
