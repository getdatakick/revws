// @flow

import type { EmailPreferences } from 'back/types';
import React from 'react';
import Dialog, { DialogContent, DialogActions } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import List, { ListItem, ListItemText } from 'material-ui/List';
import LegalIcon from './legal';
import { isEmail } from 'common/utils/validation';
import { getWebUrl } from 'back/utils/common';
import Space from 'common/components/space/space';
import EmailIcon from 'material-ui-icons/Email';
import PlaylistAddCheck from 'material-ui-icons/PlaylistAddCheck';
import TextField from 'material-ui/TextField';
import TextWithTags from 'common/components/text-with-tags/text-with-tags';

type Props = {
  show: boolean,
  step: number,
  email: string,
  nextStep: () => void,
  setEmail: (string) => void,
  emailPreferences: EmailPreferences,
  setEmailPreferences: (EmailPreferences) => void,
  activateAccount: (string, EmailPreferences) => void,
}

const styles = {
  root: {
    transition: 'all 400ms ease',
    minHeight: 320,
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  step: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  stepWrapper: {
    paddingLeft: 40,
    paddingRight: 20
  },
  text: {
    color: '#999'
  },
  smallText: {
    color: '#aaa',
    fontSize: '85%'
  },
  textWrapper: {
    paddingTop: 30,
    height: 100
  }
};

class Registration extends React.PureComponent<Props> {
  static displayName = 'RegistrationView';

  render() {
    const { step, email, show } = this.props;
    const labels = [ __('I understand'), __('You can contact me'), __('Start using module')];
    let valid = true;
    if (step == 1) {
      valid = isEmail(email);
    }
    const marginLeft = (-step * 150) + '%';
    return (
      <Dialog open={show} maxWidth='md'>
        <DialogContent style={{width: 720}}>
          <div style={{...styles.root, marginLeft}}>
            { this.renderStep(0, LegalIcon, this.step1()) }
            { this.renderStep(1, EmailIcon, this.step2()) }
            { this.renderStep(2, PlaylistAddCheck, this.step3()) }
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.nextStep} disabled={! valid} color='accent'>
            { labels[step] }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderStep = (number: number, Icon: any, content: any) => {
    const left = (number * 150) + '%';
    return (
      <div key={number} style={{...styles.step, left}}>
        <div style={{display: 'flex'}}>
          <div style={{width: 200}}>
            <Icon style={{color: '#ccc', width: 200, height: 200}}/>
          </div>
          <div style={styles.stepWrapper}>
            {content}
          </div>
        </div>
      </div>
    );
  }

  step1 = () => (
    <div>
      <h2>{__('Licensing information')}</h2>
      <div style={styles.text}>
        <TextWithTags
          text={__("Thank you for installing free version of [1]Revws[/1] module. We are very happy to have you aboard.")}
          tags={['strong']} />
      </div>
      <Space />
      <div style={styles.text}>
        <TextWithTags
          text={__("This is an [1]open source[/1] project released under the [2]AFL 3.0[/2] license. That means you are free to use, modify, and copy this software in any way you wish.")}
          tags={[
            'strong',
            {
              tag: 'a',
              params: {
                href: 'https://opensource.org/licenses/AFL-3.0',
                target: '_blank'
              }
            }
          ]} />
      </div>
    </div>
  );

  step2 = () => (
    <div>
      <h2>{__('Contact permission')}</h2>
      <div style={styles.text}>
        <TextWithTags
          text={__("We need your permission to contact you in [1]emergency[/1] situations, for example if we discover a serious [2]security[/2] bug")}
          tags={['strong', 'strong']} />
      </div>

      <div style={styles.textWrapper}>
        <TextField
          id="name"
          fullWidth={true}
          label={__('Email address')}
          value={this.props.email}
          placeholder={__('Please enter your contact email address')}
          onChange={e => this.props.setEmail(e.target.value)} />
      </div>

      <div style={styles.smallText}>
        <TextWithTags
          text={__("We promise that we will [1]not disclose[/1] your email address to anyone or use it to [2]spam[/2] you. We will not send you automated [3]marketing[/3] emails unless you [4]opt-in[/4] for it.[5][/5]You can read our [6]privacy policy[/6] here.")}
          tags={[
            'strong',
            'strong',
            'strong',
            'strong',
            'br',
            {
              tag: 'a',
              params: {
                href: getWebUrl('activation', 'privacy-policy'),
                target: "_blank"
              }
            }
          ]} />
      </div>
    </div>
  );

  step3 = () => (
    <div>
      <h2>{__('What emails can we send you?')}</h2>
      <div style={styles.text}>
        <TextWithTags
          text={__("Please choose what type of [1]emails[/1] you would like to receive from us. You can always [2]change[/2] your preferences later")}
          tags={["strong", "strong"]} />
      </div>
      <List>
        <ListItem dense button onClick={this.togglePreference('release')}>
          { this.renderCheckbox('release') }
          <ListItemText
            primary={__("New release notification")}
            secondary={__("we will let you know when new version is available")} />
        </ListItem>
        <ListItem dense button onClick={this.togglePreference('education')}>
          { this.renderCheckbox('education') }
          <ListItemText
            primary={__("Tutorials and suggestions")}
            secondary={__("learn how to utilize this module to its full potential")} />
        </ListItem>
        <ListItem dense button onClick={this.togglePreference('marketing')}>
          { this.renderCheckbox('marketing') }
          <ListItemText
            primary={__("Marketing offers")}
            secondary={__("we can send you discount offers or deals")} />
        </ListItem>
      </List>
    </div>
  );

  nextStep= () => {
    const { step, email, emailPreferences, activateAccount, nextStep } = this.props;
    if (step === 2 && isEmail(email)) {
      activateAccount(email, emailPreferences);
    } else {
      nextStep();
    }
  }

  renderCheckbox = (key: string) => {
    const { emailPreferences } = this.props;
    const value = !!emailPreferences[key];
    return (
      <Checkbox checked={value} disableRipple />
    );
  }

  togglePreference = (key: string) => () => {
    const { emailPreferences, setEmailPreferences } = this.props;
    const value = !emailPreferences[key];
    setEmailPreferences({ ...emailPreferences, [ key ]: value });
  }

}

export default Registration;
