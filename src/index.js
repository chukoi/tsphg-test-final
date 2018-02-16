/**
 * index.js
 *
 * @dateCreated 16/02/2018
 * @author Dean Heffernan
 */

// Imports.
import React from 'react';
import ReactDOM from 'react-dom';
import Form from './containers/Form';
import { Provider } from 'react-redux';
import store from './store';

// Render the Form application.
ReactDOM.render(
  <Provider store={store}>
      <Form />
  </Provider>,
  document.getElementById('root')
);

// Set up hot loader for rapid development.
if (module.hot) {
  module.hot.accept('./containers/Form', () => {
    const NextApp = require('./containers/Form').default;
    ReactDOM.render(
      <Provider store={store}>
          <NextApp />
      </Provider>,
      document.getElementById('root')
    );
  });
  window.store = store;
}