// @flow

import { markdown } from 'markdown';
import { is, forEach } from 'ramda';

const isArray = is(Array);

const fixLinks = (m:any) => {
  if (m[0] === "link") {
    m[1].target = '_blank';
  } else {
    forEach(n => isArray(n) && fixLinks(n), m);
  }
};

export const toHTML = (text: string): any => {
  const tree = markdown.parse(text);
  fixLinks(tree);
  return markdown.renderJsonML(markdown.toHTMLTree(tree));
};
