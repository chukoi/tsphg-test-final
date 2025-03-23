/**
 * index.js
 *
 * @dateCreated 16/02/2018
 * @author Dean Heffernan
 */

// Imports.
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
import Form from "./components/Form";

// Render the Form application.
ReactDOM.render(
  <Provider store={store}>
    <Form />
  </Provider>,
  document.getElementById("root")
);

// Set up hot loader for rapid development.
if (module.hot) {
  module.hot.accept("./components/Form", () => {
    const NextApp = require("./components/Form").default;
    ReactDOM.render(
      <Provider store={store}>
        <NextApp />
      </Provider>,
      document.getElementById("root")
    );
  });
  window.store = store;
}
