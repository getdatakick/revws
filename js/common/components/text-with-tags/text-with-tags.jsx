// @flow
import type {Element} from 'react';
import React from 'react';
import type { Tag } from 'common/types.js';
import { replaceTags } from 'common/utils/translation.js';

type Props = {|
  text: string,
  tags: Array<Tag>
|};

class TextWithTags extends React.PureComponent<Props> {
  static displayName: ?string = 'TextWithTags';

  render(): Element<"span"> {
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
