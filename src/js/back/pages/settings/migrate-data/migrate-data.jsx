// @flow
import React from 'react';
import type { EnvironmentType } from 'back/types';
import List, {
  ListItem,
  ListItemAvatar,
  ListItemText
} from 'material-ui/List';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';

export type InputProps = {
  baseUrl: string,
  environment: EnvironmentType
};

type Props = InputProps & {
  onMigrate: (string, any) => void
}

type State = {
  confirm: boolean
}

class MigrateData extends React.PureComponent<Props, State> {
  static displayName = 'MigrateData';

  state = {
    confirm: false
  }

  render() {
    const { environment, baseUrl } = this.props;
    const disabled = !environment.productcomments;
    const { confirm } = this.state;
    return (
      <div>
        <List>
          <ListItem button onClick={this.toggleConfirm} disabled={disabled}>
            <ListItemAvatar>
              <Avatar src={baseUrl+'views/img/productcomments.png'} alt={"Product comments"} />
            </ListItemAvatar>
            <ListItemText
              primary={"Product comments"}
              secondary={__("Migrate reviews and criteria from product comments module")} />
          </ListItem>
        </List>
        <Dialog
          fullWidth={true}
          maxWidth='md'
          open={confirm}
          onClose={this.toggleConfirm} >
          <DialogTitle>
            {__('Are you sure?')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {__('This action will delete all your curent reviews and criteria settings!')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.toggleConfirm}>
              {__('Cancel')}
            </Button>
            <Button onClick={this.onMigrate} color="accent">
              {__('Migrate data')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  toggleConfirm = () => {
    this.setState({
      confirm: !this.state.confirm
    });
  }

  onMigrate = () => {
    this.setState({ confirm: false });
    this.props.onMigrate('productcomments', {});
  }
}

export default MigrateData;
