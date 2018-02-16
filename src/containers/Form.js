/**
 * Form.js
 *
 * @dateCreated 16/02/2018
 * @author Dean Heffernan
 */

// Imports.
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import RaisedButton from 'material-ui/RaisedButton';
import {fetchSchema} from '../redux/schema';
import Field from './Field';
import './Form.css';

class Form extends Component {

  /**
   * Set the initial state variables.
   *
   * @return {null}
   */
  componentWillMount() {
    // TODO: Need to figure out a better way to set the required and disabled object based on the schema.
    // TODO: Use Redux.
    this.setState({
      // Dynamic form schema.
      schema: [],
      // Output for the form to submit.
      output: {},
      // Store any errors and their messaged.
      errors: {},
      // I use a flat object here to make sure required fields have a value. Because some fields are composed it will be difficult to traverse and check.
      flat: {},
      // Fields that are required.
      required: {
        name: true,
        dob: true
      },
      // Fields to be disabled.
      disabled: {
        guardian_contact: true,
        guardian_name: true
      },
      // State of the validity of the form. Initially it's false.
      formValid: false,
    });
  }

  /**
   * Get the manifest file top build the dynamic form.
   *
   * @return {null}
   */
  componentDidMount() {
    this.props.fetchSchema();
  }

  /**
   * Set the value of the field to the output json to be sent with the form submit.
   *
   * @param {*} event The event that's fired when the value changes.
   * @param {*} newValue The value of the field when the user inputs.
   * @return {void}
   */
  checkFieldValue(event, newValue) {
    const scope = this.scope,
    field = this.field;

    // For select fields the value returns a number so we have to get the actual value from the options.
    if (field.type === 'select') {
      newValue = field.options[newValue];
    }

    // Initially the field has no errors
    let errors = Object.assign(scope.state.errors, {
      [field.name]: ''
    }),
      // Check for any validations on the field.
    validations = field.validations;

    // Make sure the validation is array.
    // TODO: need to ensure that that the keys test and errorMessage are present.
    if (Array.isArray((validations))) {
      // Go through each validator.
      for (let i = 0; i < validations.length; i++) {
        // Test the validation.
        // I used eval here but this can be a security risk. I'm willing to get feedback about this.
        // TODO: For the validation that the name has to be two words separated by a space I tried to use a regex but for some reason would fail. Need to investigate.
        let f = eval(validations[i].test);
        let v = f(newValue);
        if (v) {
          // The validation has failed so we set the error field to the error message.
          errors = Object.assign(scope.state.errors, {
            [field.name]: validations[i].errorMessage
          });
          // Do a render and show the errors on the field.
          // TODO: Use Redux.
          scope.setState({
            errors: errors,
          });
          // We break here because the field only allows one error message at a time.
          break;
        }
      }
    }
    // Validations have passed so we set the value for the field.
    scope.setValue(field, newValue);
  }

  /**
   * Set the value of the field to the output json to be sent with the form submit.
   *
   * @param {object} field The field the is being updated.
   * @param {*} value The value of the field when an onChange event occurs..
   * @return {void}
   */
  setValue(field, value) {
    // Init variables.
    let output,
      array,
      flat;

    // If the value is a date we need to change to the expected format.
    // This schema could be extended to proved the format.
    if (value instanceof Date) {
      value = this.formatDate(value);
    }

    if (field.parent) {
      // If a field has a parent field we map the values as an array under the parent key.
      if (this.state.output.hasOwnProperty(field.parent) && Array.isArray(this.state.output[field.parent])) {
        // The parent field container already has the field present so we filter it out and just push it back in.
        array = this.state.output[field.parent].filter(obj => obj.type !== field.name);
        array.push({
          type: field.name,
          value: value
        });
      } else {
        // Otherwise we just add a new array with the field.
        array = [{
          type: field.name,
          value: value
        }];
      }
      // Update the object to be applied for the state.
      output = Object.assign(this.state.output, {
        [field.parent]: array
      });
      flat = Object.assign(this.state.flat, {
        [field.name]: value
      });
    } else {
      // No parent so we just set the field value against it's name.
      output = Object.assign(this.state.output, {
        [field.name]: value
      });
      flat = Object.assign(this.state.flat, {
        [field.name]: value
      });
    }

    // Re-render
    // TODO: Use Redux.
    this.setState({
      output: output,
      flat: flat
    });

    // Change has happened so we check if the form is now valid.
    this.checkValidForm();
  }

  /**
   * Use the toggle to update sub fields.
   *
   * @param {*} event The event that's fired when toggled
   * @param {boolean} toggled The state of the toggle.
   * @return {void}
   */
  toggleDisable(event, toggled) {
    // Init variables.
    const field = this.field,
      scope = this.scope;
    let disabled = {},
      required = {};

    // TODO: Add hasOwnProperty check.
    for (let key in field.requiredByToggle) {
      // Set the disable state of the field base on the toggle.
      disabled = Object.assign(scope.state.disabled, {
        [key]: !toggled
      });
      // Set the required state of the field based on the toggle.
      if (field.requiredByToggle[key]) {
        required = Object.assign(scope.state.required, {
          [key]: toggled
        });
      }
    }

    // Re-render
    // TODO: use Redux for this.
    scope.setState({
      disabled: disabled,
      required: required
    });

    // Change has happened so we check if the form is now valid.
    scope.checkValidForm();
  }

  /**
   * Utility function to format a date into yyyy-mm-dd.
   * TODO: Move this to it's only utility file for other useful functions.
   *
   * @param {Date} date The date to be formatted.
   * @return {string} Formatted date.
   */
  formatDate(date) {
    let mm = date.getMonth() + 1;
    let dd = date.getDate();

    return [date.getFullYear(),
      (mm > 9 ? '' : '0') + mm,
      (dd > 9 ? '' : '0') + dd
    ].join('-');
  };

  /**
   * Check that the form is ready to submit.
   * If ready this will just enable the "SUBMIT" button.
   *
   * @return {void}
   */
  checkValidForm() {
    // Check to see if there are outstanding errors.
    // If any exist than we can say the form is invalid and exit.
    // TODO: Add hasOwnProperty check.
    for (let error in this.state.errors) {
      if (this.state.errors[error]) {
        this.setState({
          formValid: false
        });
        return;
      }
    }
    // Check to see that all required field have values..
    // If so then we can say the form is invalid and exit.
    // TODO: Add hasOwnProperty check.
    for (let required in this.state.required) {
      if (this.state.required[required] && !this.state.flat[required]) {
        this.setState({
          formValid: false
        });
        return;
      }
    }
    // No problems. Form is ready.
    this.setState({
      formValid: true
    });
  }

  /**
   * Submit the form values.
   *
   * @return {void}
   */
  handleSumbit() {
    // TODO: Send the data through a POST api call.
    alert('Form submitted.');
  }

  /**
   * Render.
   */
  render() {
    return (
      <div>
        <form className="form">
          {/* Render all the form fields. */}
          {this.props.schema.map((field, index) => {
            return <Field
              key={index}
              field={field}
              scope={this}
              errors={this.state.errors}
              disabled={this.state.disabled}
              checkFieldValue={this.checkFieldValue} toggleDisable={this.toggleDisable}/>
          })}
        </form>
        <MuiThemeProvider>
          {/* Add a button to submit the form. */}
          <RaisedButton onClick={this.handleSumbit} label="Submit" primary={true} disabled={!this.state.formValid}/>
        </MuiThemeProvider>
        {/* Show the outputted form data as a json object. */}
        <pre>
          {
            JSON.stringify(this.state.output, null, 4)
          }
        </pre>
      </div>
    );
  }
}

/**
 * Setup the actions to update the state to the props
 *
 * @return {object}
 */
const
  mapStateToProps = (state) => {
    return {
      ...state.schema,
    };
  };
const
  mapDispatchToProps = (dispatch) =>
    bindActionCreators({fetchSchema}, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(Form);