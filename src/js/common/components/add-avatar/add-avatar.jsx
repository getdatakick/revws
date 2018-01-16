import React from 'react';
import { withStyles } from 'material-ui/styles';
import pink from 'material-ui/colors/pink';
import Avatar from 'material-ui/Avatar';
import AddIcon from 'material-ui-icons/Add';

const styles = {
  pinkAvatar: {
    color: '#fff',
    backgroundColor: pink[500],
  },
};

function IconAvatars(props) {
  const { classes } = props;
  return (
    <Avatar className={classes.pinkAvatar}>
      <AddIcon />
    </Avatar>
  );
}
export default withStyles(styles)(IconAvatars);
