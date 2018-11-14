// @flow
import type { ComponentType } from 'react';
import { toPairs, isNil, assoc, dissoc } from 'ramda';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import FilterListIcon from 'material-ui-icons/FilterList';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import { InputLabel } from 'material-ui/Input';
import { FormGroup } from 'material-ui/Form';
import type { Filters } from './types';
import type { EntityType } from 'common/types';

const toolbarStyles = theme => ({
  root: {
    paddingRight: 2,
  },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
  filters: {
    padding: 24,
    display: 'flex',
    flexDirection: 'row'
  },
  label: {
    minWidth: 200,
    paddingRight: 40
  }
});


type InputProps = {
  title: string,
  total: number,
  filters: Filters,
  entityTypes: {
    [ EntityType ]: string
  },
  onChangeFilters: (Filters)=>void
}

type Props = InputProps & {
  classes: any
};

type State = {
  showFilters: boolean,
}

class EnahncedTableToolbar extends React.PureComponent<Props, State> {
  static displayName = 'EnahncedTableToolbar';

  state = {
    showFilters: false
  }

  render() {
    const { title, total, classes } = this.props;
    const ret = [
      <Toolbar key='toolbar' className={classes.root} >
        <div className={classes.title}>
          <Typography type="title">{ title } ({total})</Typography>
        </div>
        <div className={classes.spacer} />
        <div className={classes.actions}>
          <Tooltip title={__("Filter list")}>
            <IconButton onClick={this.toggleShowFilters}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Toolbar>
    ];
    if (this.state.showFilters) {
      ret.push(this.renderFilters());
    }
    return ret;
  }

  renderFilters = () => {
    const { classes, filters, onChangeFilters, entityTypes } = this.props;
    const types = toPairs(entityTypes);
    const set = key => e => {
      const value = e.target.value;
      if (value == 'all') {
        onChangeFilters(dissoc(key, filters));
      } else {
        onChangeFilters(assoc(key, value, filters));
      }
    };
    const entityType = filters.entityType || 'all';
    const deleted = isNil(filters.deleted) ? 'all' : filters.deleted;
    const approved = isNil(filters.validated) ? 'all' : filters.validated;
    return (
      <FormGroup key='filters' className={classes.filters}>
        {types.length > 1 && (
          <FormControl className={classes.label}>
            <InputLabel>{__('Review type')}</InputLabel>
            <Select value={entityType} onChange={set('entityType')}>
              <MenuItem value={'all'}>{__('All')}</MenuItem>
              { types.map(pair => <MenuItem key={pair[0]} value={pair[0]}>{pair[1]}</MenuItem>) }
            </Select>
          </FormControl>
        )}
        <FormControl className={classes.label}>
          <InputLabel>{__('Delete status')}</InputLabel>
          <Select value={deleted} onChange={set('deleted')}>
            <MenuItem value={'all'}>{__('All')}</MenuItem>
            <MenuItem value={true}>{__('Deleted')}</MenuItem>
            <MenuItem value={false}>{__('Not deleted')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl className={classes.label}>
          <InputLabel>{__('Approval status')}</InputLabel>
          <Select value={approved} onChange={set('validated')}>
            <MenuItem value={'all'}>{__('All')}</MenuItem>
            <MenuItem value={true}>{__('Approved')}</MenuItem>
            <MenuItem value={false}>{__('Unapproved')}</MenuItem>
          </Select>
        </FormControl>
      </FormGroup>
    );
  }

  toggleShowFilters = () => {
    this.setState({
      showFilters: !this.state.showFilters
    });
  }
}

const Component: ComponentType<InputProps> = withStyles(toolbarStyles)(EnahncedTableToolbar);
export default Component;
