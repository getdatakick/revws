// @flow


export const replaceTags = (str: string, tags: Array<string>) => {
  let output = str;
  for (var i=0; i<tags.length; i++) {
    const tag = tags[i];
    const placeholder = i+1;
    const open = new RegExp('\\['+placeholder+'\\]', 'g');
    const close = new RegExp('\\[\\/'+placeholder+'\\]', 'g');
    output = output.replace(open, "<"+tag+">");
    output = output.replace(close, "</"+tag+">");
  }
  return output;
};
