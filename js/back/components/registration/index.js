// @flow
import type { ComponentType } from 'react';
import type { State } from 'back/reducer/index.js';
import type { EmailPreferences } from 'back/types.js';
import type { Props } from './registration.jsx';
import Component from './registration.jsx';
import { connect } from 'react-redux';
import { activateAccount } from 'back/actions/creators.js';
import { isActivated } from 'back/selectors/account.js';

type OwnProps = {|
  show: boolean,
|}

type Actions = {|
  activateAccount: (string, EmailPreferences) => void
|}

type PassedProps = {|
  isRtl: boolean,
|}

const mapStateToProps = (state: State): OwnProps => ({
  show: !isActivated(state),
});

const actions = {
  activateAccount
};

const merge = (props: OwnProps, actions: Actions, passed: PassedProps): Props => ({
  ...props,
  ...actions,
  ...passed
});


const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<PassedProps> = connectRedux(Component);

export default ConnectedComponent;
