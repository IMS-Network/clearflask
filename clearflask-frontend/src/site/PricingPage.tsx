import { Box, Container, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';
import { createStyles, Theme, useTheme, withStyles, WithStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CheckIcon from '@material-ui/icons/CheckRounded';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import * as Admin from '../api/admin';
import ServerAdmin, { ReduxStateAdmin } from '../api/serverAdmin';
import Loader from '../app/utils/Loader';
import HelpPopper from '../common/HelpPopper';
import notEmpty from '../common/util/arrayUtil';
import { isProd, isTracking } from '../common/util/detectEnv';
import PlanPeriodSelect from './PlanPeriodSelect';
import PricingPlan from './PricingPlan';
import PricingSlider from './PricingSlider';
import { PRE_SELECTED_PLAN_ID, SIGNUP_PROD_ENABLED } from './TrialSignupPage';

export const TrialInfoText = 'No time-limit Trial up to 10 MAU.'

/** If changed, also update PlanStore.java */
const StopTrialAfterActiveUsersReaches = 10;
const EstimatedPercUsersBecomeActive = 0.02;

const Faq: Array<{ heading: string, body: string | React.ReactNode }> = [
  {
    heading: 'What are Monthly Active Users (MAUs)?',
    body: (
      <React.Fragment>
        <p>
          Monthly Active User (MAU) is any user that has provided you feedback
          in the past month by either submitting a post, commenting or voting.
        </p>
        <p>
          Typically only about {EstimatedPercUsersBecomeActive * 100}% of your monthly unique users will provide you feedback
          every month. The main influencing factor is how tightly you integrate ClearFlask
          with your product.
        </p>
      </React.Fragment>
    ),
  },
  {
    heading: 'How do you compare MAU with "tracked users"?',
    body: (
      <React.Fragment>
        <p>
          Our competitors are charging based on "tracked users" which are
          users that have posted, commented or voted at least once in the past.
        </p>
        <p>
          Over time, you will accumulate and continue to pay for tracked users
          that are no longer providing you with feedback.
          With us, you only pay for users active in the past month.
        </p>
      </React.Fragment>
    ),
  },
  {
    heading: 'How long is the Trial period?',
    body: (
      <React.Fragment>
        <p>
          Trial period ends when you reach {StopTrialAfterActiveUsersReaches} MAU. Your MAU count will reset
          and you will be asked to provide a payment option if you haven't already.
        </p>
      </React.Fragment>
    ),
  },
];

const styles = (theme: Theme) => createStyles({
  page: {
    margin: theme.spacing(6),
  },
  header: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap-reverse',
    },
    alignItems: 'flex-end',
  },
  box: {
    border: '1px solid ' + theme.palette.grey[300],
    borderBottom: 'none',
  },
  billingSelect: {
    margin: theme.spacing(3),
  },
  image: {
    padding: theme.spacing(0, 8),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      maxWidth: 300,
    },
    width: '100%',
  },
  faqItem: {
    margin: theme.spacing(4),
  },
});

interface Props {
}
interface ConnectProps {
  plans?: Admin.Plan[];
  featuresTable?: Admin.FeaturesTable;
}
interface State {
  period?: Admin.PlanPricingPeriodEnum;
}
class PricingPage extends Component<Props & ConnectProps & RouteComponentProps & WithStyles<typeof styles, true>, State> {
  state: State = {};
  render() {
    const allPlans = this.props.plans || [];
    const periodsSet = new Set(allPlans
      .map(plan => plan.pricing?.period)
      .filter(notEmpty));
    const periods = Object.keys(Admin.PlanPricingPeriodEnum).filter(period => periodsSet.has(period as any as Admin.PlanPricingPeriodEnum));
    const selectedPeriod = this.state.period
      || (periods.length > 0 ? periods[periods.length - 1] as any as Admin.PlanPricingPeriodEnum : undefined);
    const plans = allPlans
      .filter(plan => !plan.pricing || selectedPeriod === plan.pricing.period);
    return (
      <div className={this.props.classes.page}>
        <Container maxWidth='md'>
          <div className={this.props.classes.header}>
            <div>
              <Typography component="h2" variant="h2" color="textPrimary">Pricing</Typography>
              <Typography component="div" variant="h6" color="textSecondary">Only pay for users that provide value.</Typography>
            </div>
            <Container maxWidth='md'>
              <img
                alt=''
                className={this.props.classes.image}
                src='/img/landing/pricing.svg'
              />
            </Container>
          </div>
          {periods.length > 1 && (
            <PlanPeriodSelect
              plans={this.props.plans}
              value={selectedPeriod}
              onChange={period => this.setState({ period })}
            />
          )}
        </Container>
        <br />
        <br />
        <br />
        <Container maxWidth='md'>
          <Loader loaded={!!this.props.plans}>
            <Grid container spacing={5} alignItems='stretch' justify='center'>
              {plans.map((plan, index) => (
                <Grid item key={plan.planid} xs={12} sm={6} md={4}>
                  <PricingPlan
                    plan={plan}
                    actionTitle={plan.pricing && (SIGNUP_PROD_ENABLED || !isProd()) ? 'Get started' : 'Talk to us'}
                    remark={plan.pricing ? TrialInfoText : 'Tell us what you\'re looking for'}
                    actionOnClick={() => {
                      if (isTracking()) {
                        ReactGA.event({
                          category: 'pricing',
                          action: 'click-plan',
                          label: plan.planid,
                        });
                      }
                    }}
                    actionTo={plan.pricing && (SIGNUP_PROD_ENABLED || !isProd())
                      ? {
                        pathname: '/signup',
                        state: { [PRE_SELECTED_PLAN_ID]: plan.planid },
                      }
                      : '/contact/sales'}
                  />
                </Grid>
              ))}
              <Grid item key='slider' xs={12} sm={6} md={4}>
                <PricingSlider plans={plans} estimatedPercUsersBecomeActive={EstimatedPercUsersBecomeActive} />
              </Grid>
            </Grid>
          </Loader>
        </Container>
        <br />
        <br />
        <br />
        {this.props.featuresTable && (
          <Container maxWidth='md'>
            <FeatureList name='Features' planNames={this.props.featuresTable.plans}>
              {this.props.featuresTable.features.map((feature, index) => (
                <FeatureListItem
                  key={feature.feature}
                  planContents={this.mapFeaturesTableValues(feature.values)}
                  name={feature.feature}
                  helpText={feature.terms}
                />
              ))}
            </FeatureList>
            {this.props.featuresTable.extraTerms && (
              <Box display='flex' justifyContent='center'>
                <Typography variant='caption' component='div'>{this.props.featuresTable.extraTerms}</Typography>
              </Box>
            )}
          </Container>
        )}
        <br />
        <br />
        <br />
        <Container maxWidth='md'>
          <Grid container spacing={5} alignItems='stretch' justify='center'>
            {Faq.map((faqItem, index) => (
              <Grid key={index} item xs={12} sm={6}>
                <div className={this.props.classes.faqItem}>
                  <Typography component='div' variant='h5'>
                    {faqItem.heading}
                  </Typography>
                  <br />
                  <Typography component='div' variant='body1' color='textSecondary'>
                    {faqItem.body}
                  </Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>
    );
  }

  mapFeaturesTableValues(values: string[]): (string | boolean)[] {
    return values.map(value => {
      switch (value) {
        case 'Yes': return true;
        case 'No': return false;
        default: return value;
      }
    });
  }
}

const FeatureList = withStyles(styles, { withTheme: true })((props: WithStyles<typeof styles, true> & {
  planNames: string[],
  name: string,
  children?: any,
}) => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <div className={props.classes.box}>
      <Table
        size={mdUp ? 'medium' : 'small'}
      >
        <TableHead>
          <TableRow>
            <TableCell key='feature'><Typography variant='h6'>{props.name}</Typography></TableCell>
            {props.planNames.map(planName => (
              <TableCell key={planName}>{planName}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.children}
        </TableBody>
      </Table>
    </div>
  );
});

const FeatureListItem = (props: {
  planContents: (boolean | React.ReactNode | string)[],
  name: string,
  helpText?: string
}) => {
  return (
    <TableRow key='name'>
      <TableCell key='feature'>
        {props.name}
        {props.helpText && (
          <React.Fragment>
            &nbsp;
            <HelpPopper description={props.helpText} />
          </React.Fragment>
        )}
      </TableCell>
      {props.planContents.map((content, index) => (
        <TableCell key={index}>
          {content === true
            ? (<CheckIcon fontSize='inherit' />)
            : content}
        </TableCell>
      ))}
    </TableRow>
  );
}

export default connect<ConnectProps, {}, Props, ReduxStateAdmin>((state, ownProps) => {
  if (state.plans.plans.status === undefined) {
    ServerAdmin.get().dispatchAdmin().then(d => d.plansGet());
  }
  return {
    plans: state.plans.plans.plans,
    featuresTable: state.plans.plans.featuresTable,
  };
})(withStyles(styles, { withTheme: true })(withRouter(PricingPage)));
