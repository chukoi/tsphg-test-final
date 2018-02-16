/**
 * Field.js
 *
 * @dateCreated 16/02/2018
 * @author Dean Heffernan
 */

// Imports.
import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DatePicker from 'material-ui/DatePicker';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';

export default class Field extends Component {

  /**
   * Render a field based on its type
   *
   * @param {object} field
   * @index {number} index to used for repeated component keys.
   * @return {*} The field.
   */
  renderField(field, index) {
    // Based on the field type build the material-ui element.
    // I should have maybe not used these components as they have weird behaviour and I have pass in the scope which is dirty. However it works.
    // I have to wrap everything in the MuiThemeProvider component otherwise it throws an error.
    switch (field.type) {
      case 'textfield':
        return <MuiThemeProvider
          key={index}
        >
          {/* TODO: need to set the initial errorText of the "Name" field to be required. */}
          <TextField
            scope={this.props.scope}
            field={field}
            floatingLabelText={field.label}
            floatingLabelFixed={true}
            onChange={this.props.checkFieldValue}
            errorText={this.props.errors[field.name]}
            disabled={this.props.disabled[field.name]}
          />
        </MuiThemeProvider>;
      case 'datepicker':
        return <div>
          <MuiThemeProvider>
            <DatePicker
              scope={this.props.scope}
              field={field}
              hintText="Date of Birth"
              autoOk={true}
              onChange={this.props.checkFieldValue}
            />
          </MuiThemeProvider>
          {/* Add custom error element as the DatePicker doesn't have one. Weird.*/}
          <span style={{color: 'red'}}>
          {
            this.props.errors[field.name]
          }
          </span>
        </div>;
      case 'select':
        return <MuiThemeProvider>
          <DropDownMenu
            scope={this.props.scope}
            field={field}
            onChange={this.props.checkFieldValue}
          >
            {
              field.options.map((option, index) => {
                return <MenuItem
                  key={index}
                  scope={this.props.scope}
                  field={field}
                  value={option}
                  primaryText={option}
                />
              })
            }
          </DropDownMenu>
        </MuiThemeProvider>;
      case 'toggle':
        return <div>
          <MuiThemeProvider>
            <Toggle
              scope={this.props.scope}
              field={field}
              label="Guardian Consent"
              labelPosition="right"
              onToggle={this.props.toggleDisable}
            />
          </MuiThemeProvider>
          {this.renderField(field.items[0])}
        </div>;
      case 'fieldset':
        if (field.hasOwnProperty('items') && Array.isArray(field.items)) {
          return <div>
            <h2>{field.label}</h2>
            <fieldset>
              {
                field.items.map((field, index) => {
                  return this.renderField(field, index)
                })
              }
            </fieldset>
          </div>;
        }
        break;
      default:
        return;
    }
  }

  /**
   * Render
   */
  render() {
    return (
      <div>
        {this.renderField(this.props.field)}
      </div>
    );
  }
}
