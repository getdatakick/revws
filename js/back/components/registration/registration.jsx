// @flow

import React from 'react';
import type { EmailPreferences } from 'back/types';
import RegistrationView from './registration-view';

export type Props = {
  show: boolean,
  isRtl: boolean,
  activateAccount: (string, EmailPreferences) => void
}

type State = {
  step: number,
  email: string,
  emailPreferences: EmailPreferences
}

class Registration extends React.PureComponent<Props, State> {
  static displayName = 'Registration';

  state = initialState(0, location.hostname);

  render() {
    return (
      <RegistrationView
        {...this.state}
        isRtl={this.props.isRtl}
        show={this.props.show}
        activateAccount={this.activateAccount}
        setEmail={this.setEmail}
        setEmailPreferences={this.setEmailPreferences}
        nextStep={() => this.setState({ step: this.state.step + 1})} />
    );
  }

  activateAccount = (email: string, emailPreferences: EmailPreferences) => {
    this.props.activateAccount(email, emailPreferences);
    this.setState({
      step: 1,
      email: ''
    });
  }

  setEmail = (email: string) => this.setState({ email });
  setEmailPreferences = (emailPreferences: EmailPreferences) => this.setState({ emailPreferences });
}

const initialState = (step: number, domain: string) => ({
  step: step,
  email: '',
  domain: domain,
  emailPreferences: {
    release: true,
    education: true,
    marketing: true
  }
});

export default Registration;
