// @flow
import type { ComponentType } from 'react';
import { isNil, has, assoc, dissoc } from 'ramda';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import FilterListIcon from 'material-ui-icons/FilterList';
import Checkbox from 'material-ui/Checkbox';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import type { Filters } from './types';

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
    minWidth: 300
  }
});


type InputProps = {
  title: string,
  total: number,
  filters: Filters,
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
    const { classes, filters, onChangeFilters } = this.props;
    const toggle = key => value => {
      if (has(key, filters)) {
        if (filters[key]) {
          onChangeFilters(assoc(key, false, filters));
        } else {
          onChangeFilters(dissoc(key, filters));
        }
      } else {
        onChangeFilters(assoc(key, true, filters));
      }
    };
    return (
      <FormGroup key='filters' className={classes.filters}>
        <FormControlLabel
          className={classes.label}
          control={
            <Checkbox
              checked={!! filters.deleted}
              indeterminate={isNil(filters.deleted)}
              onChange={toggle('deleted')} />
          }
          label={__("Show deleted reviews")} />
        <FormControlLabel
          className={classes.label}
          control={
            <Checkbox
              checked={!!filters.validated}
              indeterminate={isNil(filters.validated)}
              onChange={toggle('validated')} />
          }
          label={__("Show approved reviews")} />
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
