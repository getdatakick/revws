// @flow
import type {Element} from "React";import React from 'react';
import type { GradingType, CriterionType, GradingShapeType, ShapeColorsType } from 'common/types';
import Grading from 'common/components/grading/grading';

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
      <div className={'revws-review-criteria revws-review-criteria-inline'}>
        { criteria.map(this.renderCriterion) }
      </div>
    );
  }

  renderCriterion: ((crit: CriterionType, i: number) => Element<"div">) = (crit: CriterionType, i: number) => {
    const { grades, shape, shapeSize, colors } = this.props;
    const grade = grades[crit.id];
    return (
      <div key={crit.id} className='revws-review-criterion'>
        <span className='revws-criterion-label'>{ crit.label }</span>
        <Grading
          className={'revws-criterion-value'}
          grade={grade}
          shape={shape}
          type='criterion'
          size={shapeSize * 0.875}
          colors={colors} />
      </div>
    );
  }
}

export default CriteriaBlock;
