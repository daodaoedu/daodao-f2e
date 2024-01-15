import { createStore, applyMiddleware } from 'redux';
import storage from 'redux-persist/lib/storage';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};

import rootReducer from '../reducers';
import rootSaga from '../sagas';

const persistedReducer = persistReducer(persistConfig, rootReducer);

// create a makeStore function
const storeFactory = (preloadedState) => {
  const enableLog =
    process.env.NODE_ENV !== 'production' && process.env.NO_LOG !== 'TRUE';
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = enableLog ? [logger, sagaMiddleware] : [sagaMiddleware];
  const store = configureStore({
    reducer: persistedReducer,
    preloadedState,
    middleware: [...middlewares],
  });
  sagaMiddleware.run(rootSaga);
  return store;
};

export default storeFactory;
