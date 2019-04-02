import React, { Component } from 'react';
import * as ConfigEditor from '../configEditor';
import { TableHead, TableRow, TableCell, Table, Paper, TableBody, Typography, Fab, IconButton } from '@material-ui/core';
import Property from './Property';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/AddRounded';

interface Props {
  data:ConfigEditor.PageGroup|ConfigEditor.ArrayProperty;
}

interface State {
}

export default class TableProp extends Component<Props, State> {

  constructor(props:Props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const header:React.ReactNode[] = [];
    const rows:React.ReactNode[] = [];
    if(this.props.data.type === 'pagegroup') {
      const pageGroup:ConfigEditor.PageGroup = this.props.data;
      pageGroup.getChildPages().forEach((childPage, childPageIndex) => {
        const row:React.ReactNode[] = [];
        pageGroup.tablePropertyNames.forEach((propName, propNameIndex) => {
          const prop = childPage.getChildren().props.find(childPageProp => propName === childPageProp.path[childPageProp.path.length - 1])!;
          row.push(
            <TableCell key={prop.pathStr} align='center'>
              <Property bare prop={prop} />
            </TableCell>
          );
          if(childPageIndex === 0) {
            header.push(this.renderHeaderCell(propNameIndex, prop.name, prop.description));
          }
        });
        rows.push(this.renderRow(row, childPage.pathStr, childPageIndex));
      });
    } else if(this.props.data.childType === ConfigEditor.PropertyType.Object) {
      const arrayProp:ConfigEditor.ArrayProperty = this.props.data;
      arrayProp.childProperties && arrayProp.childProperties.forEach((childProp, childPropIndex) => {
        const childPropObject = childProp as ConfigEditor.ObjectProperty;
        const row:React.ReactNode[] = [];
        childPropObject.childProperties && childPropObject.childProperties.forEach((grandchildProp, grandchildPropIndex) => {
          row.push(
            <TableCell key={childPropObject.pathStr} align='center'>
              <Property bare prop={grandchildProp} />
            </TableCell>
          );
          if(childPropIndex === 0) {
            header.push(this.renderHeaderCell(grandchildPropIndex, grandchildProp.name, grandchildProp.description));
          }
        });
        rows.push(this.renderRow(row, arrayProp.pathStr, childPropIndex));
      });
    } else {
      const arrayProp:ConfigEditor.ArrayProperty = this.props.data;
      arrayProp.childProperties && arrayProp.childProperties.forEach((childProp, childPropIndex) => {
        const row = [(
          <TableCell key='0' align='center'>
            <Property prop={childProp} />
          </TableCell>
        )];
        rows.push(this.renderRow(row, arrayProp.pathStr, childPropIndex));
        if(childPropIndex === 0) {
          header.push(this.renderHeaderCell(0, childProp.name, childProp.description));
        }
      });
    }

    return (
      <Paper>
        <Table>
          {header.length > 0 && (
            <TableHead>
              <TableRow key='header'>
                {header}
                <TableCell key='delete' align='center'></TableCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {rows}
            <TableRow key='add'>
              <TableCell key='add' align='center'>
                <IconButton aria-label="Add" onClick={() => {
                  this.props.data.insert();
                }}>
                  <AddIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    );
  }

  renderRow(rowCells, key:string, index:number) {
    return (
      <TableRow key={key}>
        {rowCells}
        <TableCell key='delete' align='left'>
          <IconButton aria-label="Delete" onClick={() => {
            this.props.data.delete(index);
          }}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    )
  }

  renderHeaderCell(key, name, description) {
    // TODO display description somewhere
    return (
      <TableCell key={key} align='center'>
        {name}
      </TableCell>
    );
  }
}
