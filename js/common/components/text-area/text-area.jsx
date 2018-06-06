// @flow
import React from 'react';
import classnames from 'classnames';
import { InputLabel } from 'material-ui/Input';
import { FormHelperText } from 'material-ui/Form';
import styles from './text-area.less';

type Props = {
  value: ?string,
  rows: number,
  label: string,
  placeholder?: string,
  error?: ?boolean,
  helperText?: ?string,
  onChange?: (any)=>void
};

type State = {
  focus: boolean
}

class TextArea extends React.PureComponent<Props, State> {
  static displayName = 'TextArea';

  static defaultProps = {
    rows: 5
  };

  state = {
    focus: false
  };

  render() {
    const { placeholder, label, value, onChange, error, helperText, ...rest } = this.props;
    const clazz = classnames(styles.textArea, {
      [ styles.invalid ]: !!error
    });
    return (
      <div {...rest}>
        <InputLabel shrink={true} focused={this.state.focus} error={!!error}>{label}</InputLabel>
        <textarea
          className={clazz}
          rows={5}
          onFocus={() => this.setState({focus: true})}
          onBlur={() => this.setState({focus: false})}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange} />
        { helperText ? <FormHelperText error={!! error}>{ helperText }</FormHelperText> : undefined }
      </div>
    );
  }
}

export default TextArea;
