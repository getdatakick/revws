// @flow

import type { KeyValue } from 'common/types';
import React from 'react';
import { equals } from 'ramda';
import type { FullCriterion } from 'back/types';
import type { LanguagesType } from 'common/types';
import MultiLangField from 'common/components/multilang/multilang';
import { FormControlLabel } from 'material-ui/Form';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'common/components/dialog';
import Switch from 'material-ui/Switch';
import styles from './criteria-section.less';
import Tabs from './tabs';

type Props = {
  criterion: ?FullCriterion,
  products: ?KeyValue,
  categories: ?KeyValue,
  languages: LanguagesType,
  onSave: (FullCriterion)=>void,
  onClose: ()=>void
};

type State = {
  criterion: ?FullCriterion
}

class CriterionForm extends React.PureComponent<Props, State> {
  static displayName = 'CriterionForm';

  state = {
    criterion: this.props.criterion
  }

  componentWillReceiveProps = (nextProps: Props) => {
    if (!equals(this.props.criterion, nextProps.criterion)) {
      this.setState({
        criterion: nextProps.criterion
      });
    }
  }


  render() {
    const { onClose } = this.props;
    const criterion = this.state.criterion;
    const isSame = equals(criterion, this.props.criterion);
    return (
      <Dialog
        maxWidth='md'
        fullWidth={true}
        open={!! criterion}
        disableBackdropClick={true}
        onClose={onClose} >
        {criterion ? (
          <div>
            <DialogTitle>{__('Edit criterion')}</DialogTitle>
            <DialogContent>
              { this.renderContent(criterion) }
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>
                {__('Cancel')}
              </Button>
              <Button onClick={this.submit} disabled={isSame} color="accent">
                {__('Save')}
              </Button>
            </DialogActions>
          </div>
        ) : ''}
      </Dialog>
    );
  }

  renderContent(criterion: FullCriterion) {
    const { languages } = this.props;
    const { label, global } = criterion;
    return (
      <div>
        <div className={styles.space} />
        <div className={styles.group}>
          <MultiLangField
            label={__("Label")}
            values={label}
            language={-1}
            fullWidth
            autoFocus
            languages={languages}
            onChange={label => this.setCriterion({...criterion, label })} />
          <div className={styles.space} />
          <FormControlLabel
            control={(
              <Switch
                checked={global}
                onChange={(event, checked) => this.setCriterion({...criterion, global: checked})} />
            )}
            label={__("Applies to entire catalog")} />
          { !global && this.renderAssociations(criterion) }
        </div>
      </div>
    );
  }

  renderAssociations = (criterion: FullCriterion) => {
    const { products, categories } = this.props;
    return (
      <Tabs
        products={products}
        categories={categories}
        selectedProducts={criterion.products}
        selectedCategories={criterion.categories}
        onSetProducts={products => this.setCriterion({...criterion, products})}
        onSetCategories={categories => this.setCriterion({...criterion, categories})}
      />
    );
  }

  setCriterion = (criterion: FullCriterion) => {
    this.setState({ criterion });
  }

  submit = () => {
    const criterion = this.state.criterion;
    if (criterion) {
      this.props.onSave(criterion);
    }
  }
}

export default CriterionForm;
