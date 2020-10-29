// @flow
import type { ComponentType } from 'react';
import type { GlobalDataType, SettingsType, FullCriteria } from 'back/types';
import type { State } from 'back/reducer';
import type { Props } from './moderation';
import { connect } from 'react-redux';
import { getSettings } from 'back/selectors/settings';
import { getFullCriteria } from 'back/selectors/criteria';
import Moderation from './moderation';
import { convertCriteria } from 'back/utils/criteria';


type OwnProps = {|
  settings: SettingsType,
  fullCriteria: FullCriteria
|}

type Actions = {|
|}

type PassedProps = {|
  data: GlobalDataType
|}


const mapStateToProps = (state: State): OwnProps => ({
  settings: getSettings(state),
  fullCriteria: getFullCriteria(state)
});

const actions = {
};

const merge = (props: OwnProps, actions: Actions, passed: PassedProps):Props => {
  const { fullCriteria, ...rest } = props;
  return {
    ...rest,
    ...actions,
    ...passed,
    criteria: convertCriteria(passed.data.language, fullCriteria)
  };
};

const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<PassedProps> = connectRedux(Moderation);

export default ConnectedComponent;
