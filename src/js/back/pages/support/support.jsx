// @flow
import React from 'react';
import classnames from 'classnames';
import Section from 'back/components/section/section';
import Markdown from 'back/components/markdown/markdown';
import Button from 'material-ui/Button';
import styles from './support.less';
import type { GlobalDataType } from 'back/types';
import CheckIcon from 'material-ui-icons/Cached';
import UpToDateIcon from 'material-ui-icons/Done';
import NewVersionIcon from 'material-ui-icons/InfoOutline';
import moment from 'moment';

type Props = {
  data: GlobalDataType,
  latestVersion: string,
  lastCheck: ?number,
  notes: ?string,
  newVersionAvailable: boolean,
  checking: boolean,
  checkUpdate: ()=>void,
};

const github='https://github.com/getdatakick/revws';
const forum='https://forum.thirtybees.com/topic/1422/free-module-revws-product-reviews';
const datakick = 'https://www.getdatakick.com/?utm_campaign=revws&utm_medium=web&utm_source=support';
const contact = 'https://www.getdatakick.com/contact/?utm_campaign=revws&utm_medium=web&utm_source=support';
const download = 'https://www.getdatakick.com/extras/revws-product-reviews/?utm_campaign=revws&utm_medium=web&utm_source=support';
const sendreviewrequest = 'https://forum.thirtybees.com/topic/1510/free-module-send-review-request';
const krona = 'https://forum.thirtybees.com/topic/1505/free-module-loyalty-points-genzo_krona';
const originThread = 'https://forum.thirtybees.com/topic/1235/i-m-going-to-create-a-free-module';

class SupportPage extends React.PureComponent<Props> {
  static displayName = 'SupportPage';

  render() {
    const { checking, checkUpdate } = this.props;
    return (
      <div className={styles.root}>
        <Section id="update" label={__('Update module')} indent={false}>
          { checking ? this.renderChecking() : this.renderResult() }
          <Button color='primary' onClick={checkUpdate} disabled={checking}>
            { __('Check for updates') }
          </Button>
          <Button href={download} color="default">{__('Download latest version')}</Button>
        </Section>

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
            <a target="_blank" href={forum} rel='noreferrer'>{forum}</a>
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

          <h3>Customer Loyalty module</h3>
          <div className={classnames(styles.note, styles.link)}>
            Revws module is integrated with <a target="_blank" rel='noreferrer' href={krona}>Loyalty Points - Genzo Krona</a> module.
            This module let you set up your own rewards strategy &mdash; give your customers an incentive to post reviews.
          </div>

          <h3>Send review requests by email</h3>
          <div className={classnames(styles.note, styles.link)}>
            You can also use <a target="_blank" rel='noreferrer' href={sendreviewrequest}>Send Review Request module</a>. This one
            will send an email to the customers who have purchased product, asking them for a review. Amazing tool to get those reviews.
          </div>
        </Section>

        <Section id="author" label={__('Contact')} indent={false}>
          <div className={styles.note}>
            This free review module was created by <a target="_blank" rel='noreferrer' href={contact}>Petr Hučík</a>. It is released
            as an open source under MIT license. You can modify and redistribute it as you wish.
          </div>
          <div className={styles.note}>
            If you have any questions or need help setting things up, then simply send an email to <strong>petr@getdatakick.com</strong>.
            I would love to hear about your experience with this module.
          </div>
          <div className={styles.note}>
            I also offer <strong>prestashop support</strong> and <strong>custom development</strong> services. If you are looking
            for an experience prestashop developer then send me an email.
          </div>
          <div className={styles.note}>
            You can read more about module origin in this <a target="_blank" rel='noreferrer' href={originThread}>forum thread</a>.
          </div>
        </Section>
      </div>
    );
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
          <span dangerouslySetInnerHTML={{
            __html:  __('No information available. Please click on <strong>Check for updates</strong> button to check for new version of this module')
          }} />
        </div>
      );
    }

    const last = moment(lastCheck || 0).fromNow();

    if (newVersionAvailable) {
      const ret = [
        <div key='info' className={classnames(styles.note, styles.inline, styles.accent)}>
          <NewVersionIcon />
          <span dangerouslySetInnerHTML={{
            __html:  __('New version <strong>%s</strong> is available. Last check %s', latestVersion, last)
          }} />
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
        <span dangerouslySetInnerHTML={{
          __html:  __('You have latest version <strong>%s</strong> of this module. Last check %s', data.version, last)
        }} />

      </div>
    );
  }

}

export default SupportPage;
