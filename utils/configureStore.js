import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import reducers from '../redux/reducers';
import rootSaga from '../redux/sagas';

const sagaMiddleware = createSagaMiddleware();

const configureStore = () => {
  const store = compose(
    applyMiddleware(sagaMiddleware, logger),
    // window && window.devToolsExtension && window.devToolsExtension(),
  )(createStore)(reducers);
  sagaMiddleware.run(rootSaga);
  return store;
};

export default configureStore;
