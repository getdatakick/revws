// @flow
import type { Tag } from 'common/types';
import { toPairs, map } from 'ramda';

const toParam = pair => {
  const key = pair[0];
  let value = pair[1];
  if (value.indexOf("'") > -1) {
    value = value.replace(/'/g, "\\'");
  }
  return key + "='" + value + "'";
};

export const replaceTags = (str: string, tags: Array<Tag>): string => {
  let output = str;
  for (var i=0; i<tags.length; i++) {
    const tag = tags[i];
    const placeholder = i+1;
    const open = new RegExp('\\['+placeholder+'\\]', 'g');
    const close = new RegExp('\\[\\/'+placeholder+'\\]', 'g');
    let tagName, params;
    if (typeof tag === 'string') {
      tagName = tag;
      params = '';
    } else {
      tagName = tag.tag;
      params = tag.params ? map(toParam, toPairs(tag.params)).join(' ').trim() : '';
      if (params) {
        params = ' ' + params;
      }
    }
    output = output.replace(open, "<"+tagName+params+">");
    output = output.replace(close, "</"+tagName+">");
  }
  return output;
};
