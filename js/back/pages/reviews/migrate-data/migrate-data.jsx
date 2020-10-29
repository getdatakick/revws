// @flow
import type {Element} from "React";import React from 'react';
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
} from 'common/components/dialog';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';
import Dropzone from 'react-dropzone';

export type InputProps = {
  baseUrl: string,
  environment: EnvironmentType
};

type Props = InputProps & {
  onMigrate: (string, any) => void,
  onUploadYotpo: (File) => void
}

type ImportType = 'productcomments' | 'yotpo';

type State = {
  type: ?ImportType
}

class MigrateData extends React.PureComponent<Props, State> {
  static displayName: ?string = 'MigrateData';

  state: State = {
    type: null
  }

  input: any | null = null;

  render(): Element<"div"> {
    const { environment, baseUrl } = this.props;
    const disabled = !environment.productcomments;
    const { type } = this.state;
    return (
      <div>
        <List>
          <ListItem button onClick={this.confirmInstall('productcomments')} disabled={disabled}>
            <ListItemAvatar>
              <Avatar src={baseUrl+'views/img/productcomments.png'} alt={"Product comments"} />
            </ListItemAvatar>
            <ListItemText
              primary={"Product comments"}
              secondary={__("Migrate reviews and criteria from product comments module")} />
          </ListItem>
          <ListItem button onClick={this.confirmInstall('yotpo')}>
            <ListItemAvatar>
              <Avatar src={baseUrl+'views/img/yotpo.svg'} alt={"Yotpo reviews"} />
            </ListItemAvatar>
            <ListItemText
              primary={"Yotpo reviews"}
              secondary={__("Migrate reviews from CSV file generated by yotpo")} />
          </ListItem>

        </List>
        <Dialog
          fullWidth={true}
          maxWidth='md'
          open={!! type}
          onClose={this.confirmInstall(null)} >
          <DialogTitle>
            {__('Are you sure?')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {__('This action will delete all your curent reviews and criteria settings!')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.confirmInstall(null)}>
              {__('Cancel')}
            </Button>
            <Button onClick={this.onMigrate} color="accent">
              {__('Migrate data')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dropzone
          ref={d => this.input = d}
          accept='.csv'
          onDrop={this.onUploadFile}
          style={{display: 'none'}} />

      </div>
    );
  }

  confirmInstall: ((type: ?ImportType) => () => void) = (type: ?ImportType) => () => {
    this.setState({ type });
  }

  onMigrate: (() => void) = () => {
    const type = this.state.type;
    this.setState({ type: null });
    if (type === 'productcomments') {
      this.props.onMigrate('productcomments', {});
    } else if (type === 'yotpo') {
      this.input && this.input.open();
    }
  }

  onUploadFile: ((files: Array<File>) => void) = (files: Array<File>) => {
    if (files && files.length > 0) {
      this.props.onUploadYotpo(files[0]);
    }
  }
}

export default MigrateData;
