import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import { featureStoreReducers } from './reducers';
import { apis, views } from '../experiment-tracking/reducers/Reducers';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  combineReducers({
    entities: combineReducers({ ...featureStoreReducers }),
    views: views,
    apis: apis,
  }),
  {},
  composeEnhancers(applyMiddleware(thunk, promiseMiddleware())),
);

export default store;
