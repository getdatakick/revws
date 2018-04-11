// @flow

import type { NameFormatType } from 'common/types';
import { has } from 'ramda';
import { isFunction } from 'common/utils/ramda';

const firstCharUpperCase = (str: string) => {
  if (str.length > 0) {
    return str[0].toUpperCase();
  }
  return '';
};

const getInitial = (name: string) => {
  return name ? firstCharUpperCase(name) + '.' : '';
};

const customFormat = (firstName: string, lastName: string, pseudonym: string, functionName: string) => {
  if (functionName && has(functionName, window) && isFunction(window[functionName])) {
    return window[functionName](firstName, lastName, pseudonym);
  }
  console.error('Custom format function not found. Please create javascript function "'+functionName+'"');
  return (firstName +' '+lastName).trim();
};

export const formatName = (firstName: ?string, lastName: ?string, pseudonym: ?string, nameFormat: NameFormatType): string => {
  firstName = (firstName || '').trim();
  lastName = (lastName || '').trim();
  pseudonym = (pseudonym || '').trim();
  if (nameFormat === 'custom') {
    return customFormat(firstName, lastName, pseudonym, 'revwsFormatName');
  }
  if (nameFormat === 'pseudonym' && pseudonym) {
    return pseudonym;
  }
  if (firstName || lastName) {
    switch (nameFormat) {
      case 'firstName':
        return firstName;
      case 'lastName':
        return lastName;
      case 'initials':
        return (getInitial(firstName) + getInitial(lastName)).trim();
      case 'initialLastName':
        return (firstName + ' '  + getInitial(lastName)).trim();
      case 'fullName':
      default:
        return (firstName+' '+lastName).trim();
    }
  }
  return '';
};
