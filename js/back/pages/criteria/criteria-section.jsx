// @flow
import type {Node, Element} from "React";import React from 'react';
import type { EntityType, LanguagesType, KeyValue } from 'common/types';
import type { Load, FullCriteria, FullCriterion } from 'back/types';
import { keys, map, always, values, sortBy, prop } from 'ramda';
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
import styles from './criteria.less';

type Props = {
  entityType: EntityType,
  criteria: FullCriteria,
  selectProducts: boolean,
  selectCategories: boolean,
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
  static displayName: ?string = 'CriteriaSection';

  state: State = {
    delete: null,
    edit: null
  }

  componentDidMount() {
    const { selectProducts, products, selectCategories, categories, loadData } = this.props;
    const load = {};
    if (selectProducts && !products) {
      load.products = {
        record: 'entities',
        entityType: 'product'
      };
    }
    if (selectCategories && !categories) {
      load.categories = {
        record: 'categories',
      };
    }
    if (keys(load).length) {
      loadData(load);
    }
  }

  render(): Element<"div"> {
    const criteria = sortBy(prop('id'), values(this.props.criteria));
    return (
      <div className={styles.section}>
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

  renderCriterion: ((crit: FullCriterion) => Node) = (crit: FullCriterion) => {
    const language = this.props.language;
    const { id, label, active, global, categories, products, entityType } = crit;
    return (
      <ListItem key={id} button onClick={e => this.setEdit(id)}>
        <ListItemAvatar>
          <Avatar className={styles.avatar}>
            { active ? <ActiveIcon /> : <InactiveIcon /> }
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={label[language]}
          secondary={describeCriterion(active, entityType, global, categories, products)}
        />
        <ListItemSecondaryAction>
          <IconButton onClick={() => this.triggerDeleteCriterion(id)}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  renderEditForm: (() => Node) = () => {
    const { onSaveCriterion, languages, selectProducts, products, selectCategories, categories } = this.props;
    const edit = this.state.edit;
    const criterion = this.getCriterion(edit);
    return (
      <Form
        selectProducts={selectProducts}
        products={products}
        selectCategories={selectCategories}
        categories={categories}
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

  getCriterion: ((id: ?number) => ?FullCriterion) = (id: ?number): ?FullCriterion => {
    const { entityType, criteria, languages } = this.props;
    if (! id) {
      return null;
    }
    if (id === -1) {
      return {
        id,
        entityType,
        global: true,
        active: true,
        label: map(always(''), languages),
        products: [],
        categories: []
      };
    }
    return criteria[id];
  }

  closeEditForm: (() => void) = () => {
    this.setEdit(null);
  }

  setEdit: ((id: ?number) => void) = (id: ?number) => {
    this.setState({ edit: id });
  }

  triggerDeleteCriterion: ((id: ?number) => void) = (id: ?number) => {
    this.setState({ delete: id });
  }
}

const describeCriterion = (active, entityType, global, categories, products) => {
  if (! active) {
    return (
      <span>
        <b>
          {__('Disabled criterion')}
          &nbsp;
        </b>
        { describeCriterion(true, entityType, global, categories, products)}
      </span>
    );
  }
  if (entityType === 'product') {
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
  }
};

const count = (val) => {
  if (val) {
    return values(val).length;
  }
  return 0;
};

export default CriteriaSection;
