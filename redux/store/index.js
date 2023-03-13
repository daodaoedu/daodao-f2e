import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { configureStore } from '@reduxjs/toolkit';

import rootReducer from '../reducers';
import rootSaga from '../sagas';

// create a makeStore function
const storeFactory = (preloadedState) => {
  const enableLog =
    process.env.NODE_ENV !== 'production' && process.env.NO_LOG !== 'TRUE';
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = enableLog ? [logger, sagaMiddleware] : [sagaMiddleware];
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: [...middlewares],
  });
  sagaMiddleware.run(rootSaga);
  return store;
};

export default storeFactory;
