// @flow
import React from 'react';
import type { SettingsType, GlobalDataType } from 'back/types';
import type { CriteriaType } from 'common/types';
import ScrollSpy from 'react-scrollspy';
import { prop, toPairs, path, last, merge, range, map, curry, equals, assocPath } from 'ramda';
import Section from 'back/components/section/section';
import ShapeSelect from './shape-select';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import PageWithFooter from 'common/components/page-with-footer/page-with-footer';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import Checkbox from 'material-ui/Checkbox';
import Preview from './review-preview';
import MenuItem from 'material-ui/Menu/MenuItem';
import TextField from 'material-ui/TextField';
import CriteriaSection from './criteria-section';
import MigrateData from './migrate-data';
import { hasErrors, validateIsNumber, validateReviewEmail } from 'common/utils/validation';
import styles from './style.less';
import ColorPicker from 'common/components/color-picker/trigger';

type Props = {
  data: GlobalDataType,
  criteria: CriteriaType,
  settings: SettingsType,
  pageWidth: number,
  saveSettings: (SettingsType)=>void
};

type State = {
  settings: SettingsType,
  expanded: ?string
}

class Settings extends React.PureComponent<Props, State> {

  state = {
    expanded: null,
    settings: this.props.settings
  };

  handleChange = (panel: string) => (event: Event, expanded: boolean) => {
    this.setState({
      expanded: expanded ? panel : null
    });
  };

  isExpanded = (panel: string) => panel === this.state.expanded;

  render() {
    const errors = this.validate();
    const changed = !equals(this.state.settings , this.props.settings);
    return (
      <PageWithFooter
        width={this.props.pageWidth}
        showFooter={changed}
        content={this.renderContent(errors)}
        footer={this.renderFooter(errors)} />
    );
  }

  renderContent = (errors: any) => {
    const sections = [
      {
        key: 'general',
        label: __('General settings'),
        content: this.renderGeneralSettings()
      },
      {
        key: 'reviews',
        label: __('Reviews'),
        content: this.renderReview()
      },
      {
        key: 'theme',
        label: __('Theme and Appearance'),
        content: this.renderTheme()
      },
      {
        key: 'product-detail',
        label: __('Product detail page'),
        content: this.renderProductDetail(errors)
      },
      {
        key: 'product-detail',
        label: __('Product listing page'),
        content: this.renderProductList()
      },
      {
        key: 'product-comparison',
        label: __('Product comparison page'),
        content: this.renderProductComparison()
      },
      {
        key: 'customer-account',
        label: __('Customer account page'),
        content: this.renderCustomerAccount(errors)
      },
      {
        key: 'rich-snippets',
        label: __('Structured Data / Rich Snippets'),
        content: this.renderRichSnippets()
      },
      {
        key: 'moderation',
        label: __('Review moderation'),
        content: this.renderModeration()
      },
      {
        key: 'admin-notifications',
        label: __('Admin notifications'),
        content: this.renderAdminNotifications(errors)
      },
      {
        key: 'customer-notifications',
        label: __('Customer notifications'),
        content: this.renderCustomerNotifications()
      },
      {
        key: 'criteria',
        label: __('Review criteria'),
        content: this.renderCriteria()
      },
      {
        key: 'migrate',
        label: __('Migrate data'),
        subheader: __('Import review data and criteria settings from other modules'),
        content: this.renderMigrateData()
      },
      {
        key: 'module',
        label: __('Module update'),
        content: this.renderModuleSettings()
      }
    ];
    const items = map(sectionKey, sections);
    return (
      <Grid container>
        <Grid item md={4} hidden={{smDown: true}}>
          <div style={{position: 'fixed'}}>
            <h2>{__('Settings')}</h2>
            <ScrollSpy items={items} className={styles.sectionList} currentClassName={styles.activeSection}>
              { sections.map((section, i) => (
                <li className={styles.sectionListItem} key={i}>
                  <a href={'#'+sectionKey(section)}>{section.menuLabel || section.label}</a>
                </li>
              )) }
            </ScrollSpy>
          </div>
        </Grid>
        <Grid item md={8} sm={12}>
          { sections.map((section, i) => (
            <Section key={i} id={sectionKey(section)} label={section.label} subheader={prop('subheader', section)}>
              { section.content }
            </Section>
          )) }
        </Grid>
      </Grid>
    );
  }

  renderFooter = (errors: any) => {
    const invalid = hasErrors(errors);
    return (
      <div className={styles.footerContent}>
        <Button onClick={this.onReset}>
          {__('Cancel')}
        </Button>
        <Button disabled={invalid} raised color="accent" onClick={this.onSaveSettings}>
          {__('Save changes')}
        </Button>
      </div>
    );
  }

  renderTheme = () => {
    const { shapes, shopName } = this.props.data;
    const { theme, review } = this.state.settings;
    const size = theme.shapeSize.product;
    const sizes = map(v => v*2, range(5, 13));
    const colors = theme.colors;
    return (
      <div>
        <div className={styles.groups}>
          <div className={styles.group}>
            <ShapeSelect
              colors={colors}
              onChange={this.set(['theme', 'shape'])}
              shape={theme.shape}
              shapes={shapes}
            />
            <div className={styles.space} />
            <TextField
              select
              label={__("Rating shape size")}
              value={size}
              fullWidth
              onChange={this.setSize}>
              { map(value => <MenuItem key={value} value={value}>{value}</MenuItem>, sizes) }
            </TextField>
            <div className={styles.space} />
            <TextField
              select
              label={__("Display multiple criteria")}
              value={review.displayCriteria}
              fullWidth
              onChange={e => this.set(['review', 'displayCriteria'], e.target.value)}>
              <MenuItem value='none'>{__("Don't show criteria")}</MenuItem>
              <MenuItem value='inline'>{__("Show criteria on top")}</MenuItem>
              <MenuItem value='side'>{__("Show criteria on side")}</MenuItem>
            </TextField>
          </div>
          <div className={styles.group}>
            <ColorPicker
              color={colors.fillColor}
              label={__("Fill color - filled shape")}
              onChange={this.set(['theme', 'colors', 'fillColor'])}
            />
            <ColorPicker
              color={colors.borderColor}
              label={__("Border color - filled shape")}
              onChange={this.set(['theme', 'colors', 'borderColor'])}
            />
            <ColorPicker
              color={colors.fillColorOff}
              label={__("Fill color - empty shape")}
              onChange={this.set(['theme', 'colors', 'fillColorOff'])}
            />
            <ColorPicker
              color={colors.borderColorOff}
              label={__("Border color - empty shape")}
              onChange={this.set(['theme', 'colors', 'borderColorOff'])}
            />
          </div>
        </div>

        <h3 className={styles.margin}>{__('Preview')}</h3>
        <Preview
          colors={colors}
          shopName={shopName}
          shape={shapes[theme.shape]}
          size={theme.shapeSize.product}
          displayCriteria={review.displayCriteria}
          canVote={review.allowVoting}
          canReport={review.allowReporting} />
      </div>
    );
  }

  renderModeration = () => {
    const enabled = this.state.settings.moderation.enabled;
    const disabled = !enabled;
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['moderation', 'enabled'])}
          label={__("All reviews must be approved")}
        />
        <div>
          <h3>{__('What to approve')}</h3>
          <div className={styles.subSection}>
            <FormControlLabel
              control={this.renderCheckbox(['moderation', 'needApprove', 'create'], disabled)}
              disabled={disabled}
              label={__("new reviews must be approved")}
            />
            <FormControlLabel
              control={this.renderCheckbox(['moderation', 'needApprove', 'edit'], disabled)}
              label={__("edits of already approved review must be validated")}
              disabled={disabled}
            />
            <FormControlLabel
              control={this.renderCheckbox(['moderation', 'needApprove', 'reported'], disabled)}
              label={__("reviews reported as abusive must be re-approved")}
              disabled={disabled}
            />
          </div>
        </div>
      </FormGroup>
    );
  }

  renderAdminNotifications = (errors: any) => {
    const settings = this.state.settings;
    const languages = toPairs(this.props.data.languages);
    const moderationDisabled = !settings.moderation.enabled;
    return (
      <FormGroup>
        <div className={styles.group}>
          <TextField
            fullWidth
            label={__("Email address for notifications")}
            value={settings.notifications.admin.email}
            onChange={e => this.set(['notifications', 'admin', 'email'], e.target.value)}
            error={!! errors.notifications.admin.email} />
          <div className={styles.space} />
          <TextField
            select
            fullWidth
            label={__("Email language")}
            value={settings.notifications.admin.language}
            onChange={e => this.set(['notifications', 'admin', 'language'], e.target.value)}
            error={!! errors.notifications.admin.email}>
            { languages.map(pair => <MenuItem key={pair[0]} value={parseInt(pair[0], 10)}>{pair[1].name}</MenuItem>) }
          </TextField>
          <div className={styles.space} />
        </div>
        <h3>{__('Send email when')}</h3>
        <div className={styles.subSection}>
          <FormControlLabel
            control={this.renderCheckbox(['notifications', 'admin', 'needApprove'], moderationDisabled)}
            disabled={moderationDisabled}
            label={__("review needs approval")} />
          <FormControlLabel
            control={this.renderCheckbox(['notifications', 'admin', 'reviewCreated'], false)}
            label={__("visitor creates new review")} />
          <FormControlLabel
            control={this.renderCheckbox(['notifications', 'admin', 'reviewUpdated'], !settings.review.allowEdit)}
            disabled={!settings.review.allowEdit}
            label={__("review author updates review")} />
          <FormControlLabel
            control={this.renderCheckbox(['notifications', 'admin', 'reviewDeleted'], !settings.review.allowDelete)}
            disabled={!settings.review.allowDelete}
            label={__("review author deletes review")} />
        </div>
      </FormGroup>
    );
  }

  renderCustomerNotifications = () => {
    const settings = this.state.settings;
    const moderationDisabled = !settings.moderation.enabled;
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['notifications', 'author', 'thankYou'])}
          label={__("Send thank you email")}
        />
        <h3>{__('Notify customer when')}</h3>
        <div className={styles.subSection}>
          <FormControlLabel
            control={this.renderCheckbox(['notifications', 'author', 'reviewApproved'], moderationDisabled)}
            disabled={moderationDisabled}
            label={__("employee approves review")} />
          <FormControlLabel
            control={this.renderCheckbox(['notifications', 'author', 'reviewDeleted'], false)}
            label={ moderationDisabled ? __("employee deletes review") : __("employee rejects review") } />
          <FormControlLabel
            control={this.renderCheckbox(['notifications', 'author', 'reply'], false)}
            label={__("employee replies to review")} />
        </div>
      </FormGroup>
    );
  }

  renderCriteria = () => {
    const { languages, language } = this.props.data;
    return (
      <CriteriaSection
        language={language}
        languages={languages}/>
    );
  }

  renderMigrateData = () => {
    const { environment, baseUrl } = this.props.data;
    return (
      <MigrateData
        environment={environment}
        baseUrl={baseUrl}
      />
    );
  }

  renderSwitch = (key: Array<string>) => (
    <Switch
      key={last(key)}
      checked={path(key, this.state.settings)}
      onChange={(event, checked) => this.set(key, checked)} />
  )

  renderCheckbox = (key: Array<string>, indeterminate: boolean) => (
    <Checkbox
      key={last(key)}
      indeterminate={indeterminate}
      checked={path(key, this.state.settings)}
      onChange={(event, checked) => this.set(key, checked)} />
  )

  renderReview = () => {
    const settings = this.state.settings;
    const { krona } = this.props.data.environment;
    const func = "function revwsFormatName(firstname, lastname, pseudonym) {\n  // implement your custom logic\n  return 'fuzzy '+firstname;\n}";
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowEmpty'])}
          label={__("Allow reviews without details")}
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowReviewWithoutCriteria'])}
          label={__("Allow reviews for products without review criteria")}
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowGuestReviews'])}
          label={__("Allow reviews by annonymous visitors")}
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowDelete'])}
          label={__("Visitors can delete their reviews")}
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowEdit'])}
          label={__("Visitors can edit their reviews")}
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowVoting'])}
          label={__("Visitors can mark reviews as useful")}
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowReporting'])}
          label={__("Visitors can report abusive, fake, or incorrect reviews")}
        />
        <div className={styles.group}>
          <div className={styles.space} />
          <TextField
            select
            label={__("Default customer name format")}
            value={settings.review.displayName}
            fullWidth
            onChange={e => this.set(['review', 'displayName'], e.target.value)}>
            <MenuItem value='fullName'>John Doe</MenuItem>
            <MenuItem value='firstName'>John</MenuItem>
            <MenuItem value='lastName'>Doe</MenuItem>
            <MenuItem value='initials'>J.D.</MenuItem>
            <MenuItem value='initialLastName'>John D.</MenuItem>
            {krona && <MenuItem value='pseudonym'>Krona Pseudonym</MenuItem>}
            <MenuItem value='custom'>{__('Custom')}</MenuItem>
          </TextField>
        </div>
        {settings.review.displayName === 'custom' && (
          <div className={styles.note}>
            {__("please create javascript function named 'revwsFormatName' and include it to product page. For example")}
            <pre>{ func }</pre>
          </div>
        )}
      </FormGroup>
    );
  }

  renderProductDetail = (errors: any) => {
    const settings = this.state.settings;
    return (
      <FormGroup>
        <div className={styles.group}>
          <TextField
            select
            fullWidth
            label={__("Display reviews in")}
            value={settings.display.product.placement}
            onChange={e => this.set(['display', 'product', 'placement'], e.target.value)}>
            <MenuItem value='block'>{__('Separate block')}</MenuItem>
            <MenuItem value='tab'>{__('Tab')}</MenuItem>
          </TextField>
          <div className={styles.space} />
          <TextField
            select
            fullWidth
            label={__("Order reviews by")}
            value={settings.display.product.orderBy}
            onChange={e => this.set(['display', 'product', 'orderBy'], e.target.value)}>
            <MenuItem value='date'>{__('Date')}</MenuItem>
            <MenuItem value='grade'>{__('Ratings')}</MenuItem>
            <MenuItem value='usefulness'>{__('Votes')}</MenuItem>
          </TextField>
          <div className={styles.space} />
          <TextField
            fullWidth
            label={__("Reviews per page")}
            value={settings.display.product.reviewsPerPage}
            error={!! errors.display.product.reviewsPerPage}
            onChange={e => this.set(['display', 'product', 'reviewsPerPage'], e.target.value)} />
          <div className={styles.space} />
          <TextField
            select
            fullWidth
            label={__("Display review average in")}
            value={settings.display.product.averagePlacement}
            onChange={e => this.set(['display', 'product', 'averagePlacement'], e.target.value)}>
            <MenuItem value='rightColumn'>{__('Right column')}</MenuItem>
            <MenuItem value='buttons'>{__('Product buttons')}</MenuItem>
            <MenuItem value='none'>{__("Don't show review average")}</MenuItem>
          </TextField>
          <div className={styles.space} />
        </div>
        <FormControlLabel
          control={this.renderSwitch(['display', 'product', 'hideEmptyReviews'])}
          label={__("Hide review section when is empty")}
        />
        <FormControlLabel
          control={this.renderSwitch(['display', 'product', 'showSignInButton'])}
          label={__("Show sign in button for annonymous visitors")}
        />
      </FormGroup>
    );
  }

  renderProductList = () => {
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['display', 'productList', 'show'])}
          label={__("Show average ratings on product listing page")}
        />
      </FormGroup>
    );
  }

  renderRichSnippets = () => {
    return (
      <div>
        <FormGroup>
          <FormControlLabel
            control={this.renderSwitch(['richSnippets', 'enabled'])}
            label={__("Emit microdata / rich snippets")}
          />
        </FormGroup>
        <div className={styles.note2}>
          You can use this <a href="https://search.google.com/structured-data/testing-tool/u/0/" target="_blank">tool to test structured data</a> on your page. Disable this option only if your theme does not support product microdata, or if you use alternate way to generate microdata, for example by using <a href="https://github.com/thirtybees/jsonmodule" target="_blank">thirtybees json module</a>.
        </div>
      </div>
    );
  }

  renderCustomerAccount = (errors: any) => {
    const settings = this.state.settings;
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['display', 'myReviews', 'show'])}
          label={__("Show review section in customer account")} />
        <div className={styles.group}>
          <TextField
            fullWidth
            label={__("Reviews per page")}
            value={settings.display.myReviews.reviewsPerPage}
            error={!! errors.display.myReviews.reviewsPerPage}
            onChange={e => this.set(['display', 'myReviews', 'reviewsPerPage'], e.target.value)} />
          <div className={styles.space} />
          <TextField
            fullWidth
            label={__("Max review requests")}
            value={settings.display.myReviews.maxRequests}
            error={!! errors.display.myReviews.maxRequests}
            onChange={e => this.set(['display', 'myReviews', 'maxRequests'], e.target.value)} />
          <div className={styles.space} />
          <TextField
            fullWidth
            label={__("Icon css class")}
            value={settings.display.myReviews.iconClass}
            onChange={e => this.set(['display', 'myReviews', 'iconClass'], e.target.value)} />
          <div className={styles.space} />
        </div>
      </FormGroup>
    );
  }

  renderProductComparison = () => {
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['display', 'productComparison', 'show'])}
          label={__("Show average ratings on product comparison page")}
        />
      </FormGroup>
    );
  }

  renderModuleSettings = () => {
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['module', 'checkModuleVersion'])}
          label={__("Automatically check for new version")}
        />
        <div className={styles.note2}>
          Please not that revws module <strong>will NOT be updated automatically</strong> to the new version.
          You will only be notified about new version
        </div>
      </FormGroup>
    );
  }

  renderGeneralSettings = () => {
    const { psgdpr } = this.props.data.environment;
    const gdpr = this.state.settings.gdpr.implementation;
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['general', 'multilang'])}
          label={__("Filter reviews by current language")}
        />
        <div className={styles.space} />
        <div className={styles.group}>
          <TextField
            select
            label={__("General Data Protection Regulation")}
            value={gdpr}
            fullWidth
            onChange={e => this.set(['gdpr', 'implementation'], e.target.value)}>
            <MenuItem value='none'>{__('Submit reviews without consent')}</MenuItem>
            <MenuItem value='basic'>{__('Simple consent')}</MenuItem>
            {psgdpr && <MenuItem value='psgdpr'>{__('Official prestashop GDPR module')}</MenuItem>}
          </TextField>
        </div>
      </FormGroup>
    );
  }


  set = curry((path: Array<string>, value: any) => {
    const settings = assocPath(path, value, this.state.settings);
    this.setState({
      settings
    });
  })

  onReset = () => {
    this.setState({
      settings: this.props.settings
    });
  }

  onSaveSettings = () => {
    const settings = this.state.settings;
    this.props.saveSettings(settings);
  }

  setSize = (e:any) => {
    const settings = this.state.settings;
    const size = e.target.value;
    const shapeSize = merge(settings.theme.shapeSize, {
      product: size,
      list: size
    });
    this.set(['theme', 'shapeSize'], shapeSize);
  }

  validate = () => {
    const settings = this.state.settings;
    return {
      display: {
        product: {
          reviewsPerPage: validateIsNumber(settings.display.product.reviewsPerPage)
        },
        myReviews: {
          reviewsPerPage: validateIsNumber(settings.display.myReviews.reviewsPerPage),
          maxRequests: validateIsNumber(settings.display.myReviews.maxRequests),
        }
      },
      notifications: {
        admin: {
          email: validateReviewEmail(settings.notifications.admin.email)
        }
      }
    };
  };

}

const sectionKey = (section) => "section-"+section.key;

export default Settings;
