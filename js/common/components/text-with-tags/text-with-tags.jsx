// @flow
import React from 'react';
import type { Tag } from 'common/types';
import { replaceTags } from 'common/utils/translation';

type Props = {
  text: string,
  tags: Array<Tag>
};

class TextWithTags extends React.PureComponent<Props> {
  static displayName = 'TextWithTags';

  render() {
    const { text, tags, ...rest } = this.props;
    const innerHTML = {
      __html:  replaceTags(text, tags)
    };
    return (
      <span dangerouslySetInnerHTML={innerHTML} {...rest}/>
    );
  }
}

export default TextWithTags;
