// @flow
import type {Node} from 'react';
import React from 'react';
import type { GradingShapeType, ShapeColorsType } from 'common/types.js';
import { map, toPairs } from 'ramda';
import { MenuItem } from 'material-ui/Menu';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';
import Grading from 'common/components/grading/grading.jsx';
import styles from './style.less';

type Props = {
  shape: string,
  colors: ShapeColorsType,
  onChange: (string)=>void,
  shapes: {
    [ string ]: GradingShapeType
  }
};

class ShapeSelect extends React.PureComponent<Props> {
  static displayName: ?string = 'ShapeSelect';

  render(): Node {
    const { shape, shapes, onChange } = this.props;
    return (
      <FormControl fullWidth>
        <InputLabel>{__('Choose rating style')}</InputLabel>
        <Select
          value={shape}
          onChange={(e) => onChange(e.target.value)} >
          { map(this.renderItem, toPairs(shapes)) }
        </Select>
      </FormControl>
    );
  }

  renderItem: ((pair: [string, GradingShapeType]) => Node) = (pair: [string, GradingShapeType]) => {
    const key = pair[0];
    const shape = pair[1];
    return (
      <MenuItem key={key} value={key}>
        <Grading
          colors={this.props.colors}
          className={styles.grading}
          size={26}
          grade={5}
          shape={shape} />
      </MenuItem>
    );
  }
}

export default ShapeSelect;
