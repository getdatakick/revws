// @flow
import type { ComponentType } from 'react';
import type { GlobalDataType, SettingsType, GoTo } from 'back/types.js';
import type { State } from 'back/reducer/index.js';
import type { Props } from './settings.jsx';
import { connect } from 'react-redux';
import { getWidth } from 'back/selectors/ui.js';
import { getSettings } from 'back/selectors/settings.js';
import { setSettings } from 'back/actions/creators.js';
import Settings from './settings.jsx';

type OwnProps = {|
  pageWidth: number,
  settings: SettingsType
|}

type Actions = {|
  saveSettings: (SettingsType) => void
|}

type PassedProps = {|
  data: GlobalDataType,
  goTo: GoTo,
|};

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
