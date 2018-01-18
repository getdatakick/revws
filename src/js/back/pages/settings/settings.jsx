// @flow
import React from 'react';
import type { SettingsType, GlobalDataType } from 'back/types';
import ScrollSpy from 'react-scrollspy';
import { path, last, merge, range, map, curry, equals, assocPath } from 'ramda';
import Section from './section';
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
import { hasErrors, validateIsNumber } from 'common/utils/validation';
import styles from './style.less';

type Props = {
  data: GlobalDataType,
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
        key: 'reviews',
        label: 'Reviews',
        content: this.renderReview()
      },
      {
        key: 'theme',
        label: 'Theme and Appearance',
        content: this.renderTheme()
      },
      {
        key: 'placement',
        label: 'Display locations',
        content: this.renderPlacements(errors)
      },
      {
        key: 'moderation',
        label: 'Review moderation',
        content: this.renderModeration()
      },
      {
        key: 'criteria',
        label: 'Review criteria',
        content: this.renderCriteria()
      }
    ];
    const items = map(sectionKey, sections);
    return (
      <Grid container>
        <Grid item md={4} hidden={{smDown: true}}>
          <div style={{position: 'fixed'}}>
            <h2>Settings</h2>
            <ScrollSpy items={items} className={styles.sectionList} currentClassName={styles.activeSection}>
              { sections.map((section, i) => (
                <li className={styles.sectionListItem} key={i}>
                  <a href={'#'+sectionKey(section)}>{section.label}</a>
                </li>
              )) }
            </ScrollSpy>
          </div>
        </Grid>
        <Grid item md={8} sm={12}>
          { sections.map((section, i) => (
            <Section key={i} id={sectionKey(section)} label={section.label}>
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
          Cancel
        </Button>
        <Button disabled={invalid} raised color="accent" onClick={this.onSaveSettings}>
          Save changes
        </Button>
      </div>
    );
  }

  renderTheme = () => {
    const { shapes } = this.props.data;
    const { theme, review } = this.state.settings;
    const size = theme.shapeSize.product;
    const sizes = map(v => v*2, range(5, 13));
    return (
      <div>
        <div className={styles.group}>
          <ShapeSelect
            onChange={this.set(['theme', 'shape'])}
            shape={theme.shape}
            shapes={shapes}
          />
          <div className={styles.space} />
          <TextField
            select
            label="Rating shape size"
            value={size}
            fullWidth
            onChange={this.setSize}>
            { map(value => <MenuItem key={value} value={value}>{value}</MenuItem>, sizes) }
          </TextField>
        </div>

        <h2 className={styles.margin}>Preview</h2>
        <Preview
          shape={shapes[theme.shape]}
          size={theme.shapeSize.product}
          canVote={review.allowVoting}
          canReport={review.allowReporting} />
      </div>
    );
  }

  renderModeration = () => {
    const enabled = this.state.settings.moderation.enabled;
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['moderation', 'enabled'])}
          label="All reviews must be approved"
        />
        {enabled && (
          <div>
            <h3>What to approve</h3>
            <div className={styles.subSection}>
              <FormControlLabel
                control={this.renderCheckbox(['moderation', 'needApprove', 'create'])}
                label="new reviews must be approved"
              />
              <FormControlLabel
                control={this.renderCheckbox(['moderation', 'needApprove', 'edit'])}
                label="edits of already approved review must be validated"
              />
              <FormControlLabel
                control={this.renderCheckbox(['moderation', 'needApprove', 'reported'])}
                label="reviews reported as abusive must be re-approved"
              />
            </div>
          </div>
        )}
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

  renderSwitch = (key: Array<string>) => (
    <Switch
      key={last(key)}
      checked={path(key, this.state.settings)}
      onChange={(event, checked) => this.set(key, checked)} />
  )

  renderCheckbox = (key: Array<string>) => (
    <Checkbox
      key={last(key)}
      checked={path(key, this.state.settings)}
      onChange={(event, checked) => this.set(key, checked)} />
  )

  renderReview = () => {
    const settings = this.state.settings;
    return (
      <FormGroup>
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowEmpty'])}
          label="Allow reviews without details"
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowReviewWithoutCriteria'])}
          label="Allow reviews for products without review criteria"
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowGuestReviews'])}
          label="Allow reviews by annonymous visitors"
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowDelete'])}
          label="Visitors can delete their reviews"
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowEdit'])}
          label="Visitors can edit their reviews"
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowVoting'])}
          label="Visitors can mark reviews as useful"
        />
        <FormControlLabel
          control={this.renderSwitch(['review', 'allowReporting'])}
          label="Visitors can report abusive, fake, or incorrect reviews"
        />
        <div className={styles.group}>
          <div className={styles.space} />
          <TextField
            select
            label="Default customer name format"
            value={settings.review.displayName}
            fullWidth
            onChange={e => this.set(['review', 'displayName'], e.target.value)}>
            <MenuItem value='fullName'>John Doe</MenuItem>
            <MenuItem value='firstName'>John</MenuItem>
            <MenuItem value='lastName'>Doe</MenuItem>
            <MenuItem value='initials'>J.D.</MenuItem>
            <MenuItem value='initialLastName'>John D.</MenuItem>
          </TextField>
        </div>
      </FormGroup>
    );
  }

  renderPlacements = (errors: any) => {
    const settings = this.state.settings;
    return (
      <FormGroup>
        <h3>Product detail</h3>
        <div className={styles.group}>
          <TextField
            select
            fullWidth
            label="Display reviews in"
            value={settings.display.product.placement}
            onChange={e => this.set(['display', 'product', 'placement'], e.target.value)}>
            <MenuItem value='block'>Separate block</MenuItem>
            <MenuItem value='tab'>Tab</MenuItem>
          </TextField>
          <div className={styles.space} />
          <TextField
            select
            fullWidth
            label="Order reviews by"
            value={settings.display.product.orderBy}
            onChange={e => this.set(['display', 'product', 'orderBy'], e.target.value)}>
            <MenuItem value='date'>Date</MenuItem>
            <MenuItem value='grade'>Ratings</MenuItem>
          </TextField>
          <div className={styles.space} />
          <TextField
            fullWidth
            label="Reviews per page"
            value={settings.display.product.reviewsPerPage}
            error={!! errors.display.product.reviewsPerPage}
            onChange={e => this.set(['display', 'product', 'reviewsPerPage'], e.target.value)} />
          <div className={styles.space} />
        </div>
        <div className={styles.space} />
        <FormControlLabel
          control={this.renderSwitch(['display', 'product', 'showAverage'])}
          label="Show average ratings on product page"
        />
        <div className={styles.space} />
        <h3>Product listing</h3>
        <FormControlLabel
          control={this.renderSwitch(['display', 'productList', 'show'])}
          label="Show average ratings on product listing page"
        />
        <div className={styles.space} />
        <h3>Product comparison</h3>
        <FormControlLabel
          control={this.renderSwitch(['display', 'productComparison', 'show'])}
          label="Show average ratings on product comparison page"
        />
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
        }
      }
    };
  };

}

const sectionKey = (section) => "section-"+section.key;

export default Settings;
