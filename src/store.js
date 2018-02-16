/**
 * store.js
 *
 * @dateCreated 16/02/2018
 * @author Dean Heffernan
 */

// Imports.
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './redux/index'

// Create store with middleware.
const middleware = [
  thunk
];
const createStoreWithMiddleware = compose(
  applyMiddleware(...middleware)(createStore)
);

// Create the Redux store and add middleware to it
let store = createStoreWithMiddleware(
  rootReducer
);

// Allow hot reload to work with reducers.
if (module.hot) {
  module.hot.accept(function _() {
    store.replaceReducer(rootReducer);
  });
}

// Export store. Can be made accessible to to do dispatching.
export default store;
