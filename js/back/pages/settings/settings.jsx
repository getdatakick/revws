// @flow
import type {Node, Element} from 'react';
import React from 'react';
import type { GoTo, SettingsType, GlobalDataType } from 'back/types';
import ScrollSpy from 'react-scrollspy';
import { prop, toPairs, path, last, merge, range, map, curry, equals, assocPath } from 'ramda';
import Section from 'back/components/section/section';
import { reviewsPage, criteriaPage, supportPage } from 'back/routing';
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
import { hasErrors, validateIsNumber, validateReviewEmail } from 'common/utils/validation';
import styles from './style.less';
import ColorPicker from 'common/components/color-picker/trigger';

export type Props = {
  goTo: GoTo,
  data: GlobalDataType,
  settings: SettingsType,
  pageWidth: number,
  saveSettings: (SettingsType)=>void,
};

type State = {
  settings: SettingsType,
  expanded: ?string
}

class Settings extends React.PureComponent<Props, State> {

  state: State = {
    expanded: null,
    settings: this.props.settings
  };

  handleChange: ((panel: string) => (event: Event, expanded: boolean) => void) = (panel: string) => (event: Event, expanded: boolean) => {
    this.setState({
      expanded: expanded ? panel : null
    });
  };

  isExpanded: ((panel: string) => boolean) = (panel: string) => panel === this.state.expanded;

  render(): Node {
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

  renderContent: ((errors: any) => Node) = (errors: any) => {
    const { goTo } = this.props;
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
        key: 'product-listing',
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
        key: 'all-reviews',
        label: __('All reviews page'),
        content: this.renderAllReviewsPage(errors)
      },
      {
        key: 'images',
        label: __('Images'),
        content: this.renderImages(errors)
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
                  <a href={'#'+sectionKey(section)}>{section.label}</a>
                </li>
              )) }
            </ScrollSpy>
            <h2>{__('Shortcuts')}</h2>
            <ul className={styles.sectionList}>
              <li className={styles.sectionListItem}>
                <a onClick={() => goTo(reviewsPage())}>{__('Reviews')}</a>
              </li>
              <li className={styles.sectionListItem}>
                <a onClick={() => goTo(criteriaPage())}>{__('Manage review criteria')}</a>
              </li>
              <li className={styles.sectionListItem}>
                <a onClick={() => goTo(reviewsPage('data'))}>{__('Import and export reviews')}</a>
              </li>
              <li className={styles.sectionListItem}>
                <a onClick={() => goTo(supportPage())}>{__('Help and support')}</a>
              </li>
            </ul>
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

  renderFooter: ((errors: any) => Element<"div">) = (errors: any) => {
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

  renderTheme: (() => Element<"div">) = () => {
    const { shapes, shopName, dateFormat } = this.props.data;
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
          dateFormat={dateFormat}
          displayCriteria={review.displayCriteria}
          canVote={review.allowVoting}
          canReport={review.allowReporting} />
      </div>
    );
  }

  renderModeration: (() => Node) = () => {
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

  renderAdminNotifications: ((errors: any) => Node) = (errors: any) => {
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

  renderCustomerNotifications: (() => Node) = () => {
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

  renderSwitch: ((key: Array<string>) => Node) = (key: Array<string>) => (
    <Switch
      key={last(key)}
      checked={path(key, this.state.settings)}
      onChange={(event, checked) => this.set(key, checked)} />
  )

  renderCheckbox: ((key: Array<string>, indeterminate: boolean) => Node) = (key: Array<string>, indeterminate: boolean) => (
    <Checkbox
      key={last(key)}
      indeterminate={indeterminate}
      checked={path(key, this.state.settings)}
      onChange={(event, checked) => this.set(key, checked)} />
  )

  renderReview: (() => Node) = () => {
    const settings = this.state.settings;
    const { krona } = this.props.data.environment;
    const func = "function revwsFormatName(firstname, lastname, pseudonym) {\n  // implement your custom logic\n  return 'fuzzy '+firstname;\n}";
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowEmptyTitle'])}
          label={__("Allow reviews without title")}
        />
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
          control={this.renderSwitch(['review', 'allowMultipleReviews'])}
          label={__("Visitor can review the same product more then once")}
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

  renderProductDetail: ((errors: any) => Node) = (errors: any) => {
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
            <MenuItem value='custom'>{__('Custom placement')}</MenuItem>
            <MenuItem value='none'>{__("Don't show review average")}</MenuItem>
          </TextField>
        </div>
        {settings.display.product.averagePlacement === 'custom' && (
          <div className={styles.note}>
            {__("edit your theme's product template and insert this code anywhere you want to display review average")}
            <pre>
              { "{hook h='displayRevwsAverageRating' mod='revws'}" }
            </pre>
          </div>
        )}
        <div className={styles.space} />
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

  renderProductList: (() => Node) = () => {
    const settings = this.state.settings;
    const noReviews = settings.display.productList.noReviews;
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['display', 'productList', 'show'])}
          label={__("Show average ratings on product listing page")}
        />
        <div className={styles.space} />
        <div className={styles.group}>
          <TextField
            select
            fullWidth
            label={__("When no review exists for product")}
            value={noReviews}
            disabled={!settings.display.productList.show}
            onChange={e => this.set(['display', 'productList', 'noReviews'], e.target.value)}>
            <MenuItem value='omit'>{__("Don't render ratings")}</MenuItem>
            <MenuItem value='hide'>{__('Render ratings, but make it invisible')}</MenuItem>
            <MenuItem value='show'>{__("Render empty ratings")}</MenuItem>
          </TextField>
        </div>
        <div className={styles.note2}>
          {noReviews === 'omit' && __('No ratings markup will be rendered. Product blocks with and without ratings can have different height!')}
          {noReviews === 'hide' && __('Ratings markup will be rendered, but it will be transparent. This is useful to align height of your product blocks')}
          {noReviews === 'show' && __("Empty stars will be rendered if product hasn't been reviewed yet")}
        </div>
      </FormGroup>
    );
  }

  renderRichSnippets: (() => Element<"div">) = () => {
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

  renderImages: ((errors: any) => Element<"div">) = (errors: any) => {
    const { enabled, maxFileSize, width, height, thumbWidth, thumbHeight } = this.state.settings.images;
    const disabled = !enabled;
    return (
      <div>
        <FormGroup>
          <FormControlLabel
            control={this.renderSwitch(['images', 'enabled'])}
            label={__("Allow reviews with images")} />
          <FormControlLabel
            control={this.renderSwitch(['images', 'allowNewImages'])}
            disabled={disabled}
            label={__("Customers can upload new images")} />
          <div className={styles.group}>
            <TextField
              fullWidth
              label={__("Max image file size [MB]")}
              value={maxFileSize}
              disabled={disabled}
              error={!! errors.images.maxFileSize}
              onChange={e => this.set(['images', 'maxFileSize'], e.target.value)} />
            <div className={styles.space} />
            <TextField
              fullWidth
              label={__("Resize image - max width")}
              value={width}
              disabled={disabled}
              error={!! errors.images.width}
              onChange={e => this.set(['images', 'width'], e.target.value)} />
            <div className={styles.space} />
            <TextField
              fullWidth
              label={__("Resize image - max height")}
              value={height}
              disabled={disabled}
              error={!! errors.images.height}
              onChange={e => this.set(['images', 'height'], e.target.value)} />
            <div className={styles.space} />
            <TextField
              fullWidth
              label={__("Thubmnail width")}
              value={thumbWidth}
              disabled={disabled}
              error={!! errors.images.thumbWidth}
              onChange={e => this.set(['images', 'thumbWidth'], e.target.value)} />
            <div className={styles.space} />
            <TextField
              fullWidth
              label={__("Thumbnail height")}
              value={thumbHeight}
              disabled={disabled}
              error={!! errors.images.thumbHeight}
              onChange={e => this.set(['images', 'thumbHeight'], e.target.value)} />
          </div>
        </FormGroup>
      </div>
    );
  }

  renderCustomerAccount: ((errors: any) => Node) = (errors: any) => {
    const settings = this.state.settings;
    const disabled = !settings.display.myReviews.show;
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
            disabled={disabled}
            onChange={e => this.set(['display', 'myReviews', 'reviewsPerPage'], e.target.value)} />
          <div className={styles.space} />
          <TextField
            fullWidth
            label={__("Max review requests")}
            value={settings.display.myReviews.maxRequests}
            error={!! errors.display.myReviews.maxRequests}
            disabled={disabled}
            onChange={e => this.set(['display', 'myReviews', 'maxRequests'], e.target.value)} />
          <div className={styles.space} />
          <TextField
            fullWidth
            disabled={disabled}
            label={__("Icon css class")}
            value={settings.display.myReviews.iconClass}
            onChange={e => this.set(['display', 'myReviews', 'iconClass'], e.target.value)} />
          <div className={styles.space} />
        </div>
      </FormGroup>
    );
  }

  renderAllReviewsPage: ((errors: any) => Node) = (errors: any) => {
    const settings = this.state.settings;
    return (
      <FormGroup>
        <div className={styles.group}>
          <TextField
            fullWidth
            label={__("Reviews per page")}
            value={settings.display.allReviews.reviewsPerPage}
            error={!! errors.display.allReviews.reviewsPerPage}
            onChange={e => this.set(['display', 'allReviews', 'reviewsPerPage'], e.target.value)} />
        </div>
      </FormGroup>
    );
  }

  renderProductComparison: (() => Node) = () => {
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['display', 'productComparison', 'show'])}
          label={__("Show average ratings on product comparison page")}
        />
      </FormGroup>
    );
  }

  renderGeneralSettings: (() => Node) = () => {
    const { psgdpr } = this.props.data.environment;
    const implementation = this.state.settings.gdpr.implementation || 'none';
    const useGDPR = implementation != 'none';
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
            label={__('GDPR')}
            value={implementation || 'none'}
            fullWidth
            onChange={e => this.set(['gdpr', 'implementation'], e.target.value)}>
            <MenuItem value='none'>{__('Submit reviews without consent')}</MenuItem>
            <MenuItem value='basic'>{__('Simple consent')}</MenuItem>
            {psgdpr && <MenuItem value='psgdpr'>{__('Official prestashop GDPR module')}</MenuItem>}
          </TextField>
        </div>
        <FormControlLabel
          control={this.renderCheckbox(['gdpr', 'requiredForCustomers'], !useGDPR)}
          disabled={! useGDPR}
          label={__("consent is required even for logged-in customers")}
        />
      </FormGroup>
    );
  }


  set: any = curry((path: Array<string>, value: any) => {
    const settings = assocPath(path, value, this.state.settings);
    this.setState({
      settings
    });
  })

  onReset: (() => void) = () => {
    this.setState({
      settings: this.props.settings
    });
  }

  onSaveSettings: (() => void) = () => {
    const settings = this.state.settings;
    this.props.saveSettings(settings);
  }

  setSize: ((e: any) => void) = (e:any) => {
    const settings = this.state.settings;
    const size = e.target.value;
    const shapeSize = merge(settings.theme.shapeSize, {
      product: size,
      list: size
    });
    this.set(['theme', 'shapeSize'], shapeSize);
  }

  validate: (() => {|
  display: {|
    allReviews: {|reviewsPerPage: ?string|},
    myReviews: {|maxRequests: ?string, reviewsPerPage: ?string|},
    product: {|reviewsPerPage: ?string|},
  |},
  images: {|
    height: ?string,
    maxFileSize: ?string,
    thumbHeight: ?string,
    thumbWidth: ?string,
    width: ?string,
  |},
  notifications: {|admin: {|email: any|}|},
  |}) = () => {
    const settings = this.state.settings;
    return {
      display: {
        product: {
          reviewsPerPage: validateIsNumber(settings.display.product.reviewsPerPage)
        },
        myReviews: {
          reviewsPerPage: validateIsNumber(settings.display.myReviews.reviewsPerPage),
          maxRequests: validateIsNumber(settings.display.myReviews.maxRequests),
        },
        allReviews: {
          reviewsPerPage: validateIsNumber(settings.display.allReviews.reviewsPerPage),
        }
      },
      images: {
        maxFileSize: validateIsNumber(settings.images.maxFileSize),
        width: validateIsNumber(settings.images.width),
        height: validateIsNumber(settings.images.height),
        thumbWidth: validateIsNumber(settings.images.thumbWidth),
        thumbHeight: validateIsNumber(settings.images.thumbHeight),
      },
      notifications: {
        admin: {
          email: validateReviewEmail(settings.notifications.admin.email)
        }
      }
    };
  };

}

const sectionKey = (section:any) => "section-"+section.key;

export default Settings;
