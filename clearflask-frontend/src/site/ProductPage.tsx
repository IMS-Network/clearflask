import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import ScrollAnchor from '../common/util/ScrollAnchor';
import CollectPage from './CollectPage';
import EngagePage from './EngagePage';
import PrioritizePage from './PrioritizePage';

const styles = (theme: Theme) => createStyles({
});

class ProductPage extends Component<WithStyles<typeof styles, true>> {

  render() {
    return (
      <React.Fragment>
        <ScrollAnchor scrollOnAnchorTag='collect' />
        <CollectPage />
        <ScrollAnchor scrollOnAnchorTag='prioritize' />
        <PrioritizePage />
        <ScrollAnchor scrollOnAnchorTag='engage' />
        <EngagePage />
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProductPage);