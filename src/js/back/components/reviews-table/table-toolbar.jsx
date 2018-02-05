// @flow
import type { ComponentType } from 'react';
import React from 'react';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import FilterListIcon from 'material-ui-icons/FilterList';


const toolbarStyles = theme => ({
  root: {
    paddingRight: 2,
  },
  highlight: {
    color: theme.palette.secondary.dark,
    backgroundColor: theme.palette.secondary.light,
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
});


type InputProps = {
  title: string,
  total: number
}

type Props = InputProps & {
  classes: any
};

class EnahncedTableToolbar extends React.PureComponent<Props> {
  static displayName = 'EnahncedTableToolbar';

  render() {
    const { title, total, classes } = this.props;
    return (
      <Toolbar
        className={classNames(classes.root, {
          [classes.highlight]: false,
        })}
      >
        <div className={classes.title}>
          <Typography type="title">{ title } ({total})</Typography>
        </div>
        <div className={classes.spacer} />
        <div className={classes.actions}>
          <Tooltip title={__("Filter list")}>
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Toolbar>
    );
  }
}

const Component: ComponentType<InputProps> = withStyles(toolbarStyles)(EnahncedTableToolbar);
export default Component;
