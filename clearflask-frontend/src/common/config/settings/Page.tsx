import React, { Component } from 'react';
import * as ConfigEditor from '../configEditor';
import { Typography, TableHead, TableRow, TableCell, Checkbox } from '@material-ui/core';
import Property from './Property';
import TableProp from './TableProp';

interface Props {
  page:ConfigEditor.Page|ConfigEditor.PageGroup;
}

class Page extends Component<Props> {

  render() {
    var content;
    if(this.props.page.type === 'page') {
      const childProps = this.props.page.getChildren().props;
      content = (
        <div>
          {childProps.map(childProp => (<Property prop={childProp} />))}
        </div>
      );
    } else {
      content = (
        <div>
          <TableProp data={this.props.page} />
        </div>
      );
    }

    return (
      <div>
        {content}
      </div>
    );
  }
}

export default Page;
