// @flow
import type {Element} from 'react';
import React from 'react';
import type { GradingType, CriterionType, GradingShapeType, ShapeColorsType } from 'common/types.js';
import Grading from 'common/components/grading/grading.jsx';

type Props = {
  grades: GradingType,
  criteria: Array<CriterionType>,
  shape: GradingShapeType,
  colors?: ShapeColorsType,
  shapeSize: number,
};

class CriteriaBlock extends React.PureComponent<Props> {
  static displayName: ?string = 'CriteriaBlock';

  render(): Element<"div"> {
    const { criteria } = this.props;
    return (
      <div className={'revws-review-criteria revws-review-criteria-block'}>
        <table>
          <tbody>
            { criteria.map(this.renderCriterion) }
          </tbody>
        </table>
      </div>
    );
  }

  renderCriterion: ((crit: CriterionType, i: number) => Element<"tr">) = (crit: CriterionType, i: number) => {
    const { grades, shape, shapeSize, colors } = this.props;
    const grade = grades[crit.id];
    return (
      <tr key={crit.id}>
        <td className='revws-criterion-label'>{ crit.label }</td>
        <td className='revws-criterion-value'>
          <Grading
            grade={grade}
            shape={shape}
            type='criterion'
            size={shapeSize * 0.875}
            colors={colors} />
        </td>
      </tr>
    );
  }
}

export default CriteriaBlock;
