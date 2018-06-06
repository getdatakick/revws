// @flow
import type { VisitorType } from 'front/types';

export const isGuest = (visitor: VisitorType) => visitor.type === 'guest';
export const isLoggedIn = (visitor: VisitorType) => visitor.type === 'customer';
