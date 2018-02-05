// @flow
import React from 'react';
import classnames from 'classnames';
import type { LanguagesType, LangString } from 'common/types';
import { MenuItem } from 'material-ui/Menu';
import { assoc, map, always, propOr, toPairs } from 'ramda';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import styles from './multilang.less';

type Props = {
  label: string,
  language: number,
  values: LangString,
  fullWidth: boolean,
  languages: LanguagesType,
  onChange?: (LangString)=>void
};

type State = {
  language: number
}

class MultiLangField extends React.PureComponent<Props, State> {
  static displayName = 'MultiLangField';

  state = {
    language: this.props.language
  };

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.language != nextProps.language) {
      this.setState({
        language: nextProps.language
      });
    }
  }

  render() {
    const { label, values, languages, fullWidth, ...rest } = this.props;
    const { language } = this.state;
    const langs = toPairs(languages);
    const lang = language == -1 ? parseInt(langs[0][0], 10) : language;
    const value = propOr('', lang, values);
    return (
      <div className={classnames(styles.root, { [ styles.fullWidth ]: fullWidth })}>
        <FormControl className={styles.label}>
          <InputLabel>{ label }</InputLabel>
          <Input
            {...rest}
            value={value}
            onChange={this.onChange}
          />
        </FormControl>
        <Select className={styles.lang} renderValue={this.renderLang} value={language} onChange={this.changeLang}>
          <MenuItem value={-1}>{__('All languages')}</MenuItem>
          { langs.map(this.renderLanguage) }
        </Select>
      </div>
    );
  }

  renderLang = (id: number) => {
    if (id === -1) {
      return 'all';
    }
    return this.props.languages[id].code;
  }

  renderLanguage = (pair: [string, any]) => {
    const key = parseInt(pair[0], 10);
    const name = pair[1].name;
    return (
      <MenuItem key={key} value={key}>{name}</MenuItem>
    );
  }

  onChange = (e: any) => {
    const { values, languages, onChange } = this.props;
    const { language } = this.state;
    const value = e.target.value;
    if (onChange) {
      onChange(getValues(value, language, values, languages));
    }
  }

  changeLang = (e: any) => {
    this.setState({
      language: e.target.value
    });
  }
}

const getValues = (value, language, values, languages) => {
  if (language === -1) {
    return map(always(value), languages);
  }
  return assoc(language, value, values);
};

export default MultiLangField;
