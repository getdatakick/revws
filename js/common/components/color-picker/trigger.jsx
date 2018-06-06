// @flow
import ReactDOM from 'react-dom';
import React from 'react';
import Popover from 'material-ui/Popover';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
} from 'material-ui/List';
import Button from 'material-ui/Button';
import ColorPicker from './color-picker';
import Circle from './circle';
import styles from './color-picker.less';
import type { PresetType } from './types';

type Props = {
  label: string,
  color: string,
  onChange: (?string)=>void,
  presets?: Array<PresetType>
}

type State = {
  open: boolean,
  color: string,
}

class ColorPickerTrigger extends React.PureComponent<Props, State> {
  static displayName = 'ColorPickerTrigger';

  anchorEl = null;

  state = {
    open: false,
    color: this.props.color
  };

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      color: nextProps.color
    });
  }

  render() {
    const { open } = this.state;
    const { presets, label } = this.props;
    const hasColor = this.state.color != 'transparent';
    const color = hasColor ? this.state.color : '#ffffff';
    const secondaryText = hasColor ? color : __('Transparent');
    return (
      <div>
        <ListItem button disableGutters onClick={this.handleClick}>
          <ListItemAvatar>
            <Circle
              ref={e => this.anchorEl = ReactDOM.findDOMNode(e)}
              color={color}
              size={40} />
          </ListItemAvatar>
          <ListItemText
            primary={label}
            secondary={secondaryText} />
        </ListItem>
        <Popover
          open={open}
          anchorEl={this.anchorEl}
          anchorOrigin={{
            horizontal: -150,
            vertical: -100
          }}
          onClose={this.handleRequestClose}>
          <div className={styles.popover}>
            <ColorPicker
              color={color}
              presets={presets}
              onChange={this.onChange} />
            <div className={styles.buttons}>
              <Button onClick={this.setTransparent}>{__('Use transparent')}</Button>
              <Button onClick={this.handleRequestClose}>{__('Close')}</Button>
            </div>
          </div>
        </Popover>
      </div>
    );
  }

  onChange = (color: string) => {
    this.setState({ color });
  };

  handleClick = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      open: true,
      color: this.props.color
    });
  };

  setTransparent = () => {
    this.setState({ open: false });
    this.emit('transparent');
  }

  handleRequestClose = () => {
    this.setState({ open: false });
    this.emit(this.state.color);
  };

  emit = (newColor: string) => {
    const { color, onChange } = this.props;
    if (onChange && color != newColor) {
      onChange(newColor);
    }
  };
}

export default ColorPickerTrigger;
