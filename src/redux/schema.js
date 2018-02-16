/**
 * schema.js
 *
 * @dateCreated 16/02/2018
 * @author Dean Heffernan
 */

// Get form schema.
const construct = require('../schema/schema');

// Set initial config.
export const SCHEMA_LOADED = '@schema/loaded';
const initialState = {
  schema: []
};

/**
 * Send the schema back to build the form.
 *
 * @param {object} state
 * @param {object} action
 * @return {object} updated state
 */
export default function schema(state = initialState, action) {
  switch (action.type) {
    case SCHEMA_LOADED:
      return Object.assign({}, state, {schema: action.schema});
    default:
      return state;
  }
}

/**
 * Action creator for dispatching tje schema.
 *
 * @return {*} the file content as json
 */
export const fetchSchema = () => (dispatch) => {
  // fetch the data.
  return dispatch({
    type: SCHEMA_LOADED,
    schema: construct
  });
};
