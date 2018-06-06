// @flow
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  nodeId: string,
  children: any
};

class Portal extends React.PureComponent<Props> {
  static displayName = 'Portal';
  domNode: ?any = null;

  componentWillMount() {
    const nodeId = this.props.nodeId;
    if (document) {
      const node = document.getElementById(nodeId);
      if (node) {
        while (node.hasChildNodes()) {
          const child = node.lastChild;
          if (child) {
            node.removeChild(child);
          } else {
            break;
          }
        }
      }
      this.domNode = node;
    }
  }

  componentWillUnmount() {
    this.domNode = null;
  }

  render() {
    return this.domNode ? ReactDOM.createPortal(this.props.children, this.domNode) : null;
  }
}

export default Portal;
