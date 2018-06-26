// @flow
import React from 'react';
import type { WarningMessageType } from 'back/types';
import WarningIcon from 'material-ui-icons/Warning';
import EmailIcon from 'material-ui-icons/Email';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';

type Props = WarningMessageType;

type State = {
  opened: boolean
}

class Warning extends React.PureComponent<Props, State> {
  static displayName = 'Warning';

  state = {
    opened: false
  }

  render() {
    const { icon, message, hint } = this.props;
    const opened = this.state.opened;
    return (
      <ListItem button onClick={() => this.setState({ opened: !opened })}>
        <ListItemIcon>
          {this.renderWarningIcon(icon)}
        </ListItemIcon>
        <ListItemText
          primary={message}
          secondary={opened ? hint : undefined}/>
        {opened ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
    );
  }

  renderWarningIcon = (icon: string) => {
    const style = { color: '#8b0000' };
    switch (icon) {
      case 'email':
        return <EmailIcon style={style} />;
      case 'warning':
      default:
        return <WarningIcon style={style} />;
    }
  }
}

export default Warning;
