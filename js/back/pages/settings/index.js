// @flow
import type { ComponentType } from 'react';
import type { GlobalDataType, SettingsType } from 'back/types';
import type { State } from 'back/reducer';
import type { Props } from './settings';
import { connect } from 'react-redux';
import { getWidth } from 'back/selectors/ui';
import { getSettings } from 'back/selectors/settings';
import { setSettings } from 'back/actions/creators';
import Settings from './settings';

type OwnProps = {
  pageWidth: number,
  settings: SettingsType
}

type Actions = {
  saveSettings: (SettingsType) => void
}

type PassedProps = {
  data: GlobalDataType
};

const mapStateToProps = (state: State): OwnProps => ({
  pageWidth: getWidth(state),
  settings: getSettings(state)
});

const actions = {
  saveSettings: setSettings,
};

const merge = (props: OwnProps, actions: Actions, passed: PassedProps): Props => ({
  ...props,
  ...actions,
  ...passed
});

const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<PassedProps> = connectRedux(Settings);

export default ConnectedComponent;
