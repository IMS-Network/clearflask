import loadable from '@loadable/component';
import { Collapse, FormControl, FormControlLabel, FormHelperText, IconButton, InputAdornment, InputLabel, MenuItem, Select, Switch, TextField } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/CloseRounded';
import VisitPageIcon from '@material-ui/icons/MoreHoriz';
import PaintbrushIcon from '@material-ui/icons/Palette';
import KeyRefreshIcon from '@material-ui/icons/Refresh';
import { BaseEmoji } from 'emoji-mart/dist-es/index.js';
import ColorPicker from 'material-ui-color-picker';
import React, { Component } from 'react';
import SelectionPicker, { Label } from '../../../app/comps/SelectionPicker';
import Loading from '../../../app/utils/Loading';
import { importFailed, importSuccess } from '../../../Main';
import Overlay from '../../Overlay';
import randomUuid from '../../util/uuid';
import * as ConfigEditor from '../configEditor';
import TableProp from './TableProp';
import UpgradeWrapper from './UpgradeWrapper';

const EmojiPicker = loadable(() => import(/* webpackChunkName: "EmojiPicker", webpackPrefetch: true */'../../EmojiPicker').then(importSuccess).catch(importFailed), { fallback: (<Loading />), ssr: false });
const RichEditor = loadable(() => import(/* webpackChunkName: "RichEditor", webpackPrefetch: true */'../../RichEditor').then(importSuccess).catch(importFailed), { fallback: (<Loading />), ssr: false });

interface Props {
  key: string;
  prop: ConfigEditor.Page | ConfigEditor.PageGroup | ConfigEditor.Property;
  bare?: boolean;
  suppressDescription?: boolean;
  width?: string
  pageClicked: (path: ConfigEditor.Path) => void;
  isInsideMuiTable?: boolean;
  requiresUpgrade?: (propertyPath: ConfigEditor.Path) => boolean;
}

export default class Property extends Component<Props> {
  static inputMinWidth = '224px';
  readonly colorRef = React.createRef<HTMLDivElement>();
  unsubscribe?: () => void;

  componentDidMount() {
    this.unsubscribe = this.props.prop.subscribe(this.forceUpdate.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  render() {
    const prop = this.props.prop;
    const propDescription = this.props.suppressDescription ? undefined : prop.description;
    const name = prop.name || prop.pathStr;
    var marginTop = 30;
    var propertySetter;
    var shrink = (prop.value !== undefined && prop.value !== '') ? true : undefined;

    if (prop.type !== ConfigEditor.PageGroupType
      && prop.type !== ConfigEditor.PageType
      && prop.hide) {
      return null;
    }

    OUTER: switch (prop.type) {
      case ConfigEditor.PropertyType.Number:
      case ConfigEditor.PropertyType.Integer:
      case ConfigEditor.PropertyType.String:
        switch (prop.subType) {
          case ConfigEditor.PropSubType.Color:
            propertySetter = (
              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
              }}>
                <div ref={this.colorRef} style={{ position: 'relative' }}> {/* Div-wrapped so the absolutely positioned picker shows up in the right place */}
                  <ColorPicker
                    label={!this.props.bare ? name : undefined}
                    name='color'
                    placeholder='#FFF'
                    defaultValue={prop.defaultValue}
                    value={prop.value || ''}
                    onChange={color => (prop as ConfigEditor.StringProperty).set(color || undefined)}
                    error={!!prop.errorMsg}
                    // Hack to modify material-ui-color-picker to fix bug
                    // where a click inside the empty space inside the
                    // picker would dismiss the picker.
                    onFocus={() => setTimeout(() => {
                      var ptr: any = this.colorRef;
                      ['current', 'children', 1, 'children', 1, 'style'].forEach(next => ptr && (ptr = ptr[next]));
                      ptr && (ptr.position = 'relative');
                    }, 500)}
                    InputLabelProps={{
                      shrink: shrink,
                      error: !!prop.errorMsg,
                    }}
                    TextFieldProps={{
                      value: prop.value || '',
                      variant: 'outlined',
                      size: 'small',
                      InputProps: {
                        readOnly: true,
                        inputProps: {
                          autoComplete: 'off',
                        },
                        style: {
                          minWidth: Property.inputMinWidth,
                          width: this.props.width,
                        },
                        error: !!prop.errorMsg,
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              aria-label='Clear'
                              style={{
                                visibility: !prop.required && prop.value ? undefined : 'hidden',
                              }}
                              onClick={() => prop.set(undefined)}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                            <PaintbrushIcon
                              style={{
                                color: prop.value === undefined ? undefined : (prop.value + ''),
                              }}
                              fontSize='small'
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </div>
                {(!this.props.bare && propDescription || prop.errorMsg) && (<FormHelperText style={{ minWidth: Property.inputMinWidth, width: this.props.width }} error={!!prop.errorMsg}>{prop.errorMsg || propDescription}</FormHelperText>)}
              </div>
            );
            break OUTER;
          default:
          // Fall through to below
        }
        var fieldType;
        if (prop.type === ConfigEditor.PropertyType.String) {
          switch (prop.format) {
            case ConfigEditor.StringFormat.DateTime:
              fieldType = 'datetime-local';
              shrink = true;
              break;
            case ConfigEditor.StringFormat.Date:
            case ConfigEditor.StringFormat.Time:
              fieldType = prop.format;
              shrink = true;
              break;
            default:
              fieldType = 'text';
              break;
          }
        } else {
          fieldType = 'number';
        }
        const TextFieldCmpt = prop.subType === ConfigEditor.PropSubType.Rich
          ? RichEditor : TextField;
        propertySetter = (
          <TextFieldCmpt
            variant='outlined'
            size='small'
            id={prop.pathStr}
            label={!this.props.bare && name}
            {...({ iAgreeInputIsSanitized: true })}
            value={prop.value || ''}
            onChange={e => prop.set(e.target.value as never)}
            error={!!prop.errorMsg}
            placeholder={prop.placeholder !== undefined ? (prop.placeholder + '') : undefined}
            helperText={prop.errorMsg || (!this.props.bare && propDescription)}
            margin='none'
            multiline={(prop.subType === ConfigEditor.PropSubType.Multiline
              || prop.subType === ConfigEditor.PropSubType.Rich) as any}
            type={fieldType}
            InputLabelProps={{
              shrink: shrink,
              error: !!prop.errorMsg,
            }}
            InputProps={{
              style: {
                minWidth: Property.inputMinWidth,
                width: this.props.width,
              },
              readOnly: prop.subType === ConfigEditor.PropSubType.Emoji || prop.subType === ConfigEditor.PropSubType.Id,
              onFocus: prop.subType === ConfigEditor.PropSubType.KeyGen ? () => {
                if (!prop.value) prop.set(randomUuid());
              } : undefined,
              endAdornment: prop.subType === ConfigEditor.PropSubType.KeyGen ? (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='Re-generate key'
                    onClick={() => prop.set(randomUuid())}
                  >
                    <KeyRefreshIcon fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
            FormHelperTextProps={{
              style: {
                minWidth: Property.inputMinWidth,
                width: this.props.width,
              },
            }}
          />
        );
        if (prop.subType === ConfigEditor.PropSubType.Emoji) {
          propertySetter = (
            <Overlay
              isInsideMuiTable={this.props.isInsideMuiTable}
              popup={(
                <EmojiPicker
                  onSelect={emoji => prop.set(((emoji as BaseEmoji).native) as never)}
                />
              )}
            >
              {propertySetter}
            </Overlay>
          );
        }
        break;
      case ConfigEditor.PageType:
        const link = (
          <div>
            <IconButton aria-label="Open" onClick={() => {
              this.props.pageClicked(prop.path);
            }}>
              <VisitPageIcon />
            </IconButton>
          </div>
        );
        const description = (propDescription || prop.errorMsg)
          ? (<FormHelperText style={{ minWidth: Property.inputMinWidth, width: this.props.width }} error={!!prop.errorMsg}>{prop.errorMsg || propDescription}</FormHelperText>)
          : null;
        var content;
        if (prop.required) {
          content = (
            <>
              {description}
              {link}
            </>
          );
        } else {
          content = (
            <div>
              <div>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={!!prop.value}
                      onChange={(e, checked) => prop.set(checked ? true : undefined)}
                      color='default'
                    />
                  )}
                  label={description}
                  style={{
                    width: this.props.width,
                    minWidth: Property.inputMinWidth,
                  }}
                />
              </div>
              <Collapse in={prop.value}>
                {link}
              </Collapse>
            </div>
          );
        }
        marginTop += 16;
        propertySetter = (
          <div>
            <InputLabel error={!!prop.errorMsg}>{name}</InputLabel>
            {content}
          </div>
        );
        break;
      case ConfigEditor.PropertyType.Boolean:
      case ConfigEditor.PropertyType.Enum:
        if (prop.required && prop.type === ConfigEditor.PropertyType.Boolean) {
          propertySetter = (
            <div>
              {!this.props.bare && (<InputLabel error={!!prop.errorMsg}>{name}</InputLabel>)}
              {(!this.props.bare && propDescription || prop.errorMsg) && (<FormHelperText style={{ minWidth: Property.inputMinWidth, width: this.props.width }} error={!!prop.errorMsg}>{prop.errorMsg || propDescription}</FormHelperText>)}
              <div>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={!!prop.value}
                      onChange={(e, checked) => prop.set(checked)}
                      color='default'
                    />
                  )}
                  label={!this.props.bare && (<FormHelperText component='span' error={!!prop.errorMsg}>
                    {!!prop.value
                      ? (prop.trueLabel || 'Enabled')
                      : (prop.falseLabel || 'Disabled')}
                  </FormHelperText>)}
                  style={{
                    width: this.props.width,
                    minWidth: Property.inputMinWidth,
                  }}
                />
              </div>
            </div>
          );
          break;
        }
        var items: ConfigEditor.EnumItem[];
        var currentItem;
        if (prop.type === ConfigEditor.PropertyType.Boolean) {
          items = [
            { name: 'Default', value: 'undefined' },
            { name: 'Enabled', value: 'true' },
            { name: 'Disabled', value: 'false' },
          ];
          if (prop.value === undefined) {
            currentItem = items.find(item => item.value === 'undefined');
          } else if (prop.value === true) {
            currentItem = items.find(item => item.value === 'true');
          } else if (prop.value === false) {
            currentItem = items.find(item => item.value === 'false');
          }
        } else {
          items = prop.items;
          currentItem = items.find(item => item.value === prop.value);
        }
        shrink = !!(prop.value !== undefined && currentItem && currentItem.name);
        propertySetter = (
          <FormControl
            variant='outlined'
            size='small'
            style={{
              minWidth: Property.inputMinWidth,
              width: this.props.width,
            }}
          >
            {!this.props.bare && (<InputLabel error={!!prop.errorMsg} shrink={shrink}>{name}</InputLabel>)}
            <Select
              label={!this.props.bare ? name : undefined}
              value={prop.value !== undefined && currentItem.value ? currentItem.value : ''}
              onChange={e => {
                if (prop.type === ConfigEditor.PropertyType.Boolean) {
                  switch (e.target.value) {
                    case 'undefined':
                      prop.set(undefined as never)
                      break;
                    case 'true':
                      prop.set(true as never)
                      break;
                    case 'false':
                      prop.set(false as never)
                      break;
                  }
                } else {
                  prop.set((e.target.value) as never)
                }
              }}
              error={!!prop.errorMsg}
            >
              {items.map((item, index) => (
                <MenuItem key={item.name} value={item.value || ''}>{item.value === 'undefined'
                  ? (<em>{item.name}</em>)
                  : item.name
                }</MenuItem>
              ))}
            </Select>
            {(!this.props.bare && propDescription || prop.errorMsg) && (<FormHelperText style={{ minWidth: Property.inputMinWidth, width: this.props.width }} error={!!prop.errorMsg}>{prop.errorMsg || propDescription}</FormHelperText>)}
          </FormControl>
        );
        break;
      case ConfigEditor.PageGroupType:
      case ConfigEditor.PropertyType.Array:
        if (prop.type === ConfigEditor.PropertyType.Array && prop.childType === ConfigEditor.PropertyType.Enum && prop.childEnumItems && prop.required && prop.uniqueItems) {
          const values: Label[] = [];
          const options: Label[] = [];
          const enumValues = new Set((prop.childProperties || []).map(childProp => (childProp as ConfigEditor.EnumProperty)
            .value));
          prop.childEnumItems.forEach(enumItem => {
            const label = { label: enumItem!.name, value: enumItem!.value };
            options.push(label);
            if (enumValues.has(enumItem.value)) {
              values.push(label);
            }
          });
          propertySetter = (
            <SelectionPicker
              TextFieldProps={{
                variant: 'outlined',
                size: 'small',
              }}
              label={this.props.bare ? undefined : prop.name}
              helperText={this.props.bare ? undefined : propDescription}
              placeholder={prop.placeholder !== undefined ? (prop.placeholder + '') : undefined}
              errorMsg={prop.errorMsg}
              value={values}
              options={options}
              isMulti
              clearOnBlur
              width={this.props.width || 'max-content'}
              minWidth={Property.inputMinWidth}
              onValueChange={labels => prop
                .setRaw(labels.map(label => label.value))}
            />
          );
        } else {
          propertySetter = (
            <TableProp
              key={prop.key}
              data={prop}
              errorMsg={prop.errorMsg}
              label={!this.props.bare && name}
              helperText={!this.props.bare && propDescription}
              width={this.props.width}
              pageClicked={this.props.pageClicked}
              requiresUpgrade={this.props.requiresUpgrade}
            />
          );
        }
        break;
      case ConfigEditor.PropertyType.Object:
        const subProps = (
          <Collapse in={prop.value} style={{ marginLeft: '30px' }}>
            {prop.childProperties && prop.childProperties
              .filter(childProp => !childProp.hide)
              .map(childProp => (
                <Property {...this.props} bare={false} key={childProp.key} prop={childProp} />
              ))
            }
          </Collapse>
        );
        const enableObject = !prop.required && (
          <div>
            <FormControlLabel
              control={(
                <Switch
                  checked={!!prop.value}
                  onChange={(e, checked) => prop.set(checked ? true : undefined)}
                  color='default'
                />
              )}
              label={!this.props.bare && (<FormHelperText style={{ minWidth: Property.inputMinWidth, width: this.props.width }} error={!!prop.errorMsg}>{!!prop.value ? 'Enabled' : 'Disabled'}</FormHelperText>)}
              style={{
                marginBottom: '-10px',
                width: this.props.width,
                minWidth: Property.inputMinWidth,
              }}
            />
          </div>
        );
        marginTop += 16;
        propertySetter = (
          <div style={{ marginBottom: '10px' }}>
            {!this.props.bare && (<InputLabel error={!!prop.errorMsg}>{name}</InputLabel>)}
            {(!this.props.bare && propDescription || prop.errorMsg) && (<FormHelperText style={{ minWidth: Property.inputMinWidth, width: this.props.width }} error={!!prop.errorMsg}>{prop.errorMsg || propDescription}</FormHelperText>)}
            {enableObject}
            {subProps}
          </div>
        );
        break;
      case ConfigEditor.PropertyType.Link:
      case ConfigEditor.PropertyType.LinkMulti:
        const onValueChange = labels => {
          if (prop.type === ConfigEditor.PropertyType.LinkMulti) {
            prop.set(new Set<string>(labels.map(o => o.value)));
          } else {
            prop.set(labels.length === 0 ? undefined : labels[0].value);
          }
        };
        const onValueCreate = prop.allowCreate ? prop.create.bind(this) : undefined;
        const values: Label[] = [];
        const options: Label[] = [];
        prop.getOptions()
          .forEach(o => {
            options.push({
              label: o.name,
              filterString: o.name,
              value: o.id,
              color: o.color,
            });
          });
        if (prop.value !== undefined) {
          (prop.type === ConfigEditor.PropertyType.Link
            ? [prop.getOptions().find(o => o.id === prop.value)]
              .filter(o => o !== undefined)
            : prop.getOptions().filter(o => (prop.value as Set<string>).has(o.id)))
            .forEach(o => {
              values.push({
                label: o!.name,
                value: o!.id,
                color: o!.color,
              });
            })
        }
        propertySetter = (
          <SelectionPicker
            TextFieldProps={{
              variant: 'outlined',
              size: 'small',
            }}
            disableClearable={prop.required}
            label={this.props.bare ? undefined : prop.name}
            helperText={this.props.bare ? undefined : propDescription}
            placeholder={prop.placeholder !== undefined ? (prop.placeholder + '') : undefined}
            errorMsg={prop.errorMsg}
            value={values}
            options={options}
            showTags
            bareTags={prop.type === ConfigEditor.PropertyType.Link}
            isMulti={prop.type === ConfigEditor.PropertyType.LinkMulti}
            width={this.props.width || 'max-content'}
            minWidth={Property.inputMinWidth}
            onValueChange={onValueChange}
            onValueCreate={onValueCreate}
          />
        );
        break;
      default:
        throw Error(`Unknown property type ${prop['type']}`);
    }

    if (!propertySetter) {
      return null;
    }

    propertySetter = (
      <div style={{ marginTop: this.props.bare ? undefined : marginTop + 'px' }}>
        {propertySetter}
      </div>
    );

    if (!!this.props.requiresUpgrade && this.props.requiresUpgrade(this.props.prop.path)) {
      propertySetter = (
        <UpgradeWrapper
          propertyPath={this.props.prop.path}
        >
          {propertySetter}
        </UpgradeWrapper>
      );
    }

    return propertySetter;
  }
}
