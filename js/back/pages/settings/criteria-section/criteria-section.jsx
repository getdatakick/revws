// @flow
import React from 'react';
import type { LanguagesType, KeyValue } from 'common/types';
import type { Load, FullCriteria, FullCriterion } from 'back/types';
import { map, always, values, sortBy, prop } from 'ramda';
import List, {
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import ActiveIcon from 'material-ui-icons/Check';
import InactiveIcon from 'material-ui-icons/DoNotDisturb';
import DeleteIcon from 'material-ui-icons/Delete';
import AddAvatar from 'common/components/add-avatar/add-avatar';
import ConfirmDelete from 'common/components/confirm-delete/confirm-delete';
import Form from './form';
import styles from './criteria-section.less';

type Props = {
  criteria: FullCriteria,
  products: ?KeyValue,
  categories: ?KeyValue,
  language: number,
  languages: LanguagesType,
  loadData: ({
    [ string ]: Load
  }) => void,
  onSaveCriterion: (FullCriterion) => void,
  onDeleteCriterion: (number) => void,
};

type State = {
  delete: ?number,
  edit: ?number,
}

class CriteriaSection extends React.PureComponent<Props, State> {
  static displayName = 'CriteriaSection';

  state = {
    delete: null,
    edit: null
  }

  componentDidMount() {
    const { categories, products, loadData } = this.props;
    if (! categories || !products) {
      loadData({
        products: {
          record: 'products',
          options: 'all'
        },
        categories: {
          record: 'categories',
          options: 'all'
        }
      });
    }
  }

  render() {
    const criteria = sortBy(prop('id'), values(this.props.criteria));
    return (
      <div className={styles.root}>
        <List>
          { criteria.map(this.renderCriterion) }
          <ListItem button onClick={e => this.setEdit(-1)}>
            <ListItemAvatar>
              <AddAvatar />
            </ListItemAvatar>
            <ListItemText primary={__("Create new review criterion")} />
          </ListItem>
          { this.renderEditForm() }
          <ConfirmDelete
            deleteLabel={__('Delete criterion')}
            confirmation={__('Are you sure you want to delete this criterion?')}
            payload={this.state.delete}
            onClose={() => this.triggerDeleteCriterion(null)}
            onConfirm={id => {
              this.triggerDeleteCriterion(null);
              this.props.onDeleteCriterion(id);
            }} />
        </List>
      </div>
    );
  }

  renderCriterion = (crit: FullCriterion) => {
    const language = this.props.language;
    const { id, label, active, global, categories, products } = crit;
    return (
      <ListItem key={id} button onClick={e => this.setEdit(id)}>
        <ListItemAvatar>
          <Avatar className={styles.avatar}>
            { active ? <ActiveIcon /> : <InactiveIcon /> }
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={label[language]}
          secondary={describeCriterion(active, global, categories, products)}
        />
        <ListItemSecondaryAction>
          <IconButton onClick={() => this.triggerDeleteCriterion(id)}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  renderEditForm = () => {
    const { onSaveCriterion, languages, categories, products } = this.props;
    const edit = this.state.edit;
    const criterion = this.getCriterion(edit);
    return (
      <Form
        categories={categories}
        products={products}
        criterion={criterion}
        languages={languages}
        onClose={this.closeEditForm}
        onSave={(criterion) => {
          this.closeEditForm();
          onSaveCriterion(criterion);
        }}
      />
    );
  }

  getCriterion = (id: ?number): ?FullCriterion => {
    const { criteria, languages } = this.props;
    if (! id) {
      return null;
    }
    if (id === -1) {
      return {
        id,
        global: true,
        active: true,
        label: map(always(''), languages),
        products: [],
        categories: []
      };
    }
    return criteria[id];
  }

  closeEditForm = () => {
    this.setEdit(null);
  }

  setEdit = (id: ?number) => {
    this.setState({ edit: id });
  }

  triggerDeleteCriterion = (id: ?number) => {
    this.setState({ delete: id });
  }
}

const describeCriterion = (active, global, categories, products) => {
  if (! active) {
    return (
      <span>
        <b>
          {__('Disabled criterion')}
        </b>
        { describeCriterion(true, global, categories, products)}
      </span>
    );
  }
  if (global) {
    return __('Applies to your entire catalog');
  }
  const ccnt = count(categories);
  const pcnt = count(products);
  if (ccnt && pcnt) {
    return __('Applies to %s categories and %s products', ccnt, pcnt);
  }
  if (ccnt) {
    return __('Applies to product from %s categories', ccnt);
  }
  if (pcnt) {
    return __('Applies to %s products', pcnt);
  }
  return __('Does not apply to any product');
};

const count = (val) => {
  if (val) {
    return values(val).length;
  }
  return 0;
};

export default CriteriaSection;
