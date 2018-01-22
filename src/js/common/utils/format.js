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

const customFormat = (firstName: string, lastName: string, functionName: string) => {
  if (functionName && has(functionName, window) && isFunction(window[functionName])) {
    return window[functionName](firstName, lastName);
  }
  console.error('Custom format function not found. Please create javascript function "'+functionName+'"');
  return (firstName +' '+lastName).trim();
};

export const formatName = (firstName: ?string, lastName: ?string, nameFormat: NameFormatType): string => {
  firstName = (firstName || '').trim();
  lastName = (lastName || '').trim();
  switch (nameFormat) {
    case 'firstName':
      return firstName;
    case 'lastName':
      return lastName;
    case 'initials':
      return (firstCharUpperCase(firstName) + '.' + firstCharUpperCase(lastName) + '.').trim();
    case 'initialLastName':
      return (firstName + ' '  + firstCharUpperCase(lastName) + '.').trim();
    case 'custom':
      return customFormat(firstName, lastName, 'revwsFormatName');
    case 'fullName':
    default:
      return (firstName+' '+lastName).trim();
  }
};
