// @flow
import React from 'react';
import type { GradingShapeType } from 'common/types';
import { map, toPairs } from 'ramda';
import { MenuItem } from 'material-ui/Menu';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';
import Grading from 'common/components/grading/grading';
import styles from './style.less';

type Props = {
  shape: string,
  onChange: (string)=>void,
  shapes: {
    [ string ]: GradingShapeType
  }
};

class ShapeSelect extends React.PureComponent<Props> {
  static displayName = 'ShapeSelect';

  static defaultProps = {};

  render() {
    const { shape, shapes, onChange } = this.props;
    return (
      <FormControl fullWidth>
        <InputLabel>Choose rating style</InputLabel>
        <Select
          value={shape}
          onChange={(e) => onChange(e.target.value)} >
          { map(this.renderItem, toPairs(shapes)) }
        </Select>
      </FormControl>
    );
  }

  renderItem = (pair: [string, GradingShapeType]) => {
    const key = pair[0];
    const shape = pair[1];
    return (
      <MenuItem key={key} value={key}>
        <Grading className={styles.grading} size={26} grade={5} shape={shape} />
      </MenuItem>
    );
  }
}

export default ShapeSelect;
