// @flow
import type { VisitorType } from 'front/types';

export const isGuest = (visitor: VisitorType): boolean => visitor.type === 'guest';
export const isLoggedIn = (visitor: VisitorType): boolean => visitor.type === 'customer';
