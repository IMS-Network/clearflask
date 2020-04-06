import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Grid, IconButton, Switch, TextField } from '@material-ui/core';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import React, { Component } from 'react';
import * as Admin from '../../api/admin';
import { Server } from '../../api/server';
import CreditView from '../../common/config/CreditView';
import { saltHashPassword } from '../../common/util/auth';
import { WithMediaQuery, withMediaQuery } from '../../common/util/MediaQuery';

const styles = (theme: Theme) => createStyles({
  row: {
    padding: theme.spacing(2),
    display: 'flex',
  },
});

interface Props {
  server: Server;
  user: Admin.UserAdmin;
  credits: Admin.Credits;
  open?: boolean;
  onClose: () => void;
  onUpdated: (user: Admin.UserAdmin) => void;
  onDeleted: () => void;
}
interface State {
  deleteDialogOpen?: boolean;
  isSubmitting?: boolean;
  name?: string;
  email?: string;
  password?: string;
  revealPassword?: boolean;
  balanceAdjustment?: string;
  balanceDescription?: string;
  emailNotify?: boolean;
  iosPush?: boolean;
  androidPush?: boolean;
  browserPush?: boolean;
}
class PostEdit extends Component<Props & WithMediaQuery & WithStyles<typeof styles, true>, State> {
  state: State = {};

  render() {
    const balanceAdjustmentChanged = this.state.balanceAdjustment !== undefined && (+this.state.balanceAdjustment !== 0);
    const balanceAdjustmentHasError = !!this.state.balanceAdjustment && (!parseInt(this.state.balanceAdjustment) || !+this.state.balanceAdjustment || parseInt(this.state.balanceAdjustment) !== parseFloat(this.state.balanceAdjustment));
    const canSubmit =
      !balanceAdjustmentHasError
      && (
        this.state.name !== undefined
        || this.state.email !== undefined
        || this.state.password !== undefined
        || balanceAdjustmentChanged
        || this.state.emailNotify !== undefined
        || this.state.iosPush !== undefined
        || this.state.androidPush !== undefined
        || this.state.browserPush !== undefined
      );

    return (
      <React.Fragment>
        <Dialog
          open={this.props.open || false}
          onClose={this.props.onClose.bind(this)}
          scroll='body'
          fullScreen={this.props.mediaQuery}
          fullWidth
        >
          <DialogTitle>Edit user</DialogTitle>
          <DialogContent>
            <Grid container alignItems='baseline'>
              <Grid item xs={12} className={this.props.classes.row}>
                <TextField
                  disabled={this.state.isSubmitting}
                  label='Name'
                  fullWidth
                  value={this.state.name === undefined ? this.props.user.name : this.state.name}
                  onChange={e => this.setState({ name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} className={this.props.classes.row}>
                <TextField
                  disabled={this.state.isSubmitting}
                  label='Email'
                  fullWidth
                  value={this.state.email === undefined ? this.props.user.email : this.state.email}
                  onChange={e => this.setState({ email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} className={this.props.classes.row}>
                <TextField
                  disabled={this.state.isSubmitting}
                  label='Set password'
                  type={this.state.revealPassword ? 'text' : 'password'}
                  fullWidth
                  value={this.state.password === undefined ? '' : this.state.password}
                  onChange={e => this.setState({ password: e.target.value })}
                />
                <IconButton
                  aria-label='Toggle password visibility'
                  onClick={() => this.setState({ revealPassword: !this.state.revealPassword })}
                  disabled={this.state.isSubmitting}
                >
                  {this.state.revealPassword ? <VisibilityIcon fontSize='small' /> : <VisibilityOffIcon fontSize='small' />}
                </IconButton>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  className={this.props.classes.row}
                  disabled={this.state.isSubmitting
                    || this.state.email === ''
                    || (this.state.email === undefined && this.props.user.email === undefined)}
                  control={(
                    <Switch
                      checked={this.state.emailNotify === undefined ? this.props.user.emailNotify : this.state.emailNotify}
                      onChange={(e, checked) => this.setState({ emailNotify: checked ? undefined : false })}
                      color='primary'
                    />
                  )}
                  label={`Notifications sent to email`}
                />
              </Grid>
              {this.props.user.iosPush && (
                <Grid item xs={12}>
                  <FormControlLabel
                    className={this.props.classes.row}
                    disabled={this.state.isSubmitting}
                    control={(
                      <Switch
                        checked={this.state.iosPush === undefined ? this.props.user.iosPush : this.state.iosPush}
                        onChange={(e, checked) => this.setState({ iosPush: checked ? undefined : false })}
                        color='primary'
                      />
                    )}
                    label={`Notifications sent to Apple Push`}
                  />
                </Grid>
              )}
              {this.props.user.androidPush && (
                <Grid item xs={12}>
                  <FormControlLabel
                    className={this.props.classes.row}
                    disabled={this.state.isSubmitting}
                    control={(
                      <Switch
                        checked={this.state.androidPush === undefined ? this.props.user.androidPush : this.state.androidPush}
                        onChange={(e, checked) => this.setState({ androidPush: checked ? undefined : false })}
                        color='primary'
                      />
                    )}
                    label={`Notifications sent to Android Push`}
                  />
                </Grid>
              )}
              {this.props.user.browserPush && (
                <Grid item xs={12}>
                  <FormControlLabel
                    className={this.props.classes.row}
                    disabled={this.state.isSubmitting}
                    control={(
                      <Switch
                        checked={this.state.browserPush === undefined ? this.props.user.browserPush : this.state.browserPush}
                        onChange={(e, checked) => this.setState({ browserPush: checked ? undefined : false })}
                        color='primary'
                      />
                    )}
                    label={`Notifications sent to Browser Push`}
                  />
                </Grid>
              )}
              <Grid item xs={4} className={this.props.classes.row}>
                <TextField
                  disabled={this.state.isSubmitting}
                  label='Balance adjustment'
                  value={this.state.balanceAdjustment || ''}
                  error={balanceAdjustmentHasError}
                  helperText={balanceAdjustmentHasError ? 'Invalid number' : (
                    !this.state.balanceAdjustment ? undefined : (
                      <CreditView
                        val={+this.state.balanceAdjustment}
                        credits={this.props.credits}
                      />
                    ))}
                  onChange={e => this.setState({ balanceAdjustment: e.target.value })}
                />
              </Grid>
              <Grid item xs={8} className={this.props.classes.row}>
                <TextField
                  disabled={this.state.isSubmitting || !this.state.balanceAdjustment}
                  label='Reason for adjustment'
                  value={this.state.balanceDescription || ''}
                  onChange={e => this.setState({ balanceDescription: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} className={this.props.classes.row}>
                Account balance after adjustment:&nbsp;&nbsp;
                <CreditView
                  val={(this.props.user.balance || 0) + (!balanceAdjustmentHasError && balanceAdjustmentChanged && this.state.balanceAdjustment !== undefined ? +this.state.balanceAdjustment : 0)}
                  credits={this.props.credits}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.props.onClose()}>Close</Button>
            <Button
              disabled={this.state.isSubmitting}
              style={{ color: !this.state.isSubmitting ? this.props.theme.palette.error.main : undefined }}
              onClick={() => this.setState({ deleteDialogOpen: true })}
            >Delete</Button>
            <Button color='primary' disabled={!canSubmit || this.state.isSubmitting} onClick={() => {
              this.setState({ isSubmitting: true });
              this.props.server.dispatchAdmin().then(d => d.userUpdateAdmin({
                projectId: this.props.server.getProjectId(),
                userId: this.props.user.userId,
                userUpdateAdmin: {
                  name: this.state.name,
                  email: this.state.email,
                  password: this.state.password !== undefined ? saltHashPassword(this.state.password) : undefined,
                  emailNotify: this.state.emailNotify,
                  iosPush: this.state.iosPush,
                  androidPush: this.state.androidPush,
                  browserPush: this.state.browserPush,
                  transactionCreate: (this.state.balanceAdjustment !== undefined && balanceAdjustmentChanged) ? {
                    amount: +this.state.balanceAdjustment,
                    summary: this.state.balanceDescription,
                  } : undefined,
                },
              }))
                .then(user => {
                  this.setState({
                    isSubmitting: false,
                    name: undefined,
                    email: undefined,
                    password: undefined,
                    revealPassword: undefined,
                    balanceAdjustment: undefined,
                    balanceDescription: undefined,
                    emailNotify: undefined,
                    iosPush: undefined,
                    androidPush: undefined,
                    browserPush: undefined,
                  });
                  this.props.onUpdated(user);
                  this.props.onClose();
                })
                .catch(e => this.setState({ isSubmitting: false }))
            }}>Save</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={!!this.state.deleteDialogOpen}
          onClose={() => this.setState({ deleteDialogOpen: false })}
        >
          <DialogTitle>Delete Post</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to permanently delete this post?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ deleteDialogOpen: false })}>Cancel</Button>
            <Button
              disabled={this.state.isSubmitting}
              style={{ color: !this.state.isSubmitting ? this.props.theme.palette.error.main : undefined }}
              onClick={() => {
                this.setState({ isSubmitting: true });
                this.props.server.dispatchAdmin().then(d => d.userDeleteAdmin({
                  projectId: this.props.server.getProjectId(),
                  userId: this.props.user.userId,
                }))
                  .then(() => {
                    this.setState({ isSubmitting: false });
                    this.props.onDeleted();
                    this.props.onClose();
                  })
                  .catch(e => this.setState({ isSubmitting: false }))
              }}>Delete</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(
  withMediaQuery(theme => theme.breakpoints.down('xs'))(PostEdit));