// @flow
import React from 'react';
import classnames from 'classnames';
import Section from 'back/components/section/section';
import Markdown from 'back/components/markdown/markdown';
import Button from 'material-ui/Button';
import styles from './support.less';
import type { GlobalDataType } from 'back/types';
import CheckIcon from 'material-ui-icons/Cached';
import List from 'material-ui/List';
import UpToDateIcon from 'material-ui-icons/Done';
import NewVersionIcon from 'material-ui-icons/InfoOutline';
import Warning from './warning';
import moment from 'moment';
import TextWithTags from 'common/components/text-with-tags/text-with-tags';

type Props = {
  data: GlobalDataType,
  latestVersion: ?string,
  lastCheck: ?number,
  notes: ?string,
  paidNotes: ?string,
  newVersionAvailable: boolean,
  checking: boolean,
  checkUpdate: ()=>void,
};

const github='https://github.com/getdatakick/revws';
const forum='https://store.getdatakick.com/en/support/module/3-revws-product-reviews?utm_campaign=revws&utm_medium=web&utm_source=support';
const datakick = 'https://www.getdatakick.com/?utm_campaign=revws&utm_medium=web&utm_source=support';
const contact = 'https://www.getdatakick.com/contact/?utm_campaign=revws&utm_medium=web&utm_source=support';
const download = 'https://store.getdatakick.com/en/revws-free?utm_campaign=revws&utm_medium=web&utm_source=support';
const upgrade = 'https://store.getdatakick.com/en/modules/revws?utm_campaign=revws&utm_medium=web&utm_source=upgrade';
const krona = 'https://forum.thirtybees.com/topic/1505-1505/free-module-loyalty-points-genzo_krona';
const originThread = 'https://forum.thirtybees.com/topic/1235-1235/i-m-going-to-create-a-free-module';
const services = 'https://store.getdatakick.com/en/services?utm_campaign=revws&utm_medium=web&utm_source=support';

class SupportPage extends React.PureComponent<Props> {
  static displayName = 'SupportPage';

  render() {
    const { checking, checkUpdate, data, paidNotes } = this.props;
    const isThirtybees = data.platform === 'thirtybees';
    return (
      <div className={styles.root}>
        {this.renderWarnings()}

        <Section id="update" label={__('Update module')} indent={false}>
          { checking ? this.renderChecking() : this.renderResult() }
          <Button color='primary' onClick={checkUpdate} disabled={checking}>
            { __('Check for updates') }
          </Button>
          <Button href={download} color="default">{__('Download latest version')}</Button>
        </Section>

        { paidNotes && (
          <Section id="paid" label={__('Upgrade to premium')} indent={false}>
            <Markdown className={styles.paid} content={paidNotes} />
            <Button raised href={upgrade} color="accent">{__('Upgrade now')}</Button>
          </Section>
        )}

        <Section id="forum" label={__('Bug reporting')} indent={false}>
          <div className={styles.note}>
            If you find any bug then let me know by filing an issue on <b>github</b>
            <br />
            If you have any feature request or idea how to further develop this module, please visit <b>forum</b> and let&apos;s talk about it
          </div>
          <div className={styles.link}>
            <strong>Github:</strong>
            <a target="_blank" href={github} rel='noreferrer'>{github}</a>
          </div>
          <div className={styles.link}>
            <strong>Forum:</strong>
            <a target="_blank" href={forum} rel='noreferrer'>{forum.replace(/\?.*/g, '')}</a>
          </div>
        </Section>

        <Section id="integration" label={__('Integrations')} indent={false}>
          <div className={styles.note}>
            You can mix and match <strong>revws</strong> module with various other modules, and give your customers amazing experience.
          </div>

          <h3>Data export and import module</h3>
          <div className={classnames(styles.note, styles.link)}>
            Author of this review module also created <a target="_blank" rel='noreferrer' href={datakick}>DataKick module</a>.
            You can use it if you want to access any data this module creates and export it into CSV or XML format. Or when you need to
            import your review data from generic data files.
          </div>

          { isThirtybees && (
            <div>
              <h3>Customer Loyalty module</h3>
              <div className={classnames(styles.note, styles.link)}>
                Revws module is integrated with <a target="_blank" rel='noreferrer' href={krona}>Loyalty Points - Genzo Krona</a> module.
                This module let you set up your own rewards strategy &mdash; give your customers an incentive to post reviews.
              </div>
            </div>
          )}
        </Section>

        <Section id="author" label={__('Contact')} indent={false}>
          <div className={styles.note}>
            This free review module was created by <a target="_blank" rel='noreferrer' href={contact}>Petr Hučík</a>. It is released
            as an open source under AFL-3.0 license. You can modify and redistribute it as you wish.
          </div>
          <div className={styles.note}>
            If you have any questions or need help setting things up, then simply send an email to <strong>petr@getdatakick.com</strong>.
            I would love to hear about your experience with this module.
          </div>
          <div className={styles.note}>
            I also offer <a target="_blank" rel='noreferrer' href={services}>prestashop support</a> and <a target="_blank" rel='noreferrer' href={services}>custom development</a> services. If you are looking
            for an experience prestashop developer then send me an email.
          </div>
          <div className={styles.note}>
            You can read more about module origin in this <a target="_blank" rel='noreferrer' href={originThread}>forum thread</a>.
          </div>
        </Section>
      </div>
    );
  }

  renderWarnings = () => {
    const warnings = this.props.data.warnings;
    if (warnings && warnings.length) {
      return (
        <Section id="warnings" label={__('Detected problems')} indent={false}>
          <div className={classnames(styles.note, styles.inline)}>
            {__("We have detected following problems. This module might not work correctly unless they are fixed")}
          </div>

          <List>
            {warnings.map((warn, i) => <Warning key={i} {...warn} />)}
          </List>
        </Section>
      );
    }
  }

  renderChecking = () => (
    <div className={classnames(styles.note, styles.inline)}>
      <CheckIcon />
      { __('Checking for new version of this module') }
    </div>
  )

  renderResult = () => {
    const { notes, latestVersion, lastCheck, newVersionAvailable, data } = this.props;
    if (! latestVersion) {
      return (
        <div className={classnames(styles.note, styles.inline)}>
          <NewVersionIcon />
          <TextWithTags
            text={__('No information available. Please click on [1]Check for updates[/1] button to check for new version of this module')}
            tags={['strong']} />
        </div>
      );
    }

    const last = moment(lastCheck || 0).fromNow();

    if (newVersionAvailable) {
      const ret = [
        <div key='info' className={classnames(styles.note, styles.inline, styles.accent)}>
          <NewVersionIcon />
          <TextWithTags
            text={__('New version [1]%s[/1] is available. Last check %s', latestVersion, last)}
            tags={['strong']} />
        </div>
      ];
      if (notes) {
        ret.push(
          <div key='notes'>
            <h3>{__('Changes in new version:')}</h3>
            <Markdown className={styles.notes} content={notes} />
          </div>);
      }
      return ret;
    }
    return (
      <div className={classnames(styles.note, styles.inline)}>
        <UpToDateIcon />
        <TextWithTags
          text={__('You have latest version [1]%s[/1] of this module. Last check %s', data.version, last)}
          tags={['strong']} />

      </div>
    );
  }
}

export default SupportPage;
