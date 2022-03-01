import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import logger from "redux-logger";
import reducers from "../redux/reducers";
import rootSaga from "../redux/sagas";

const configureStore = () => {
  const isDev = process.env.NODE_ENV === "development";
  // 1. 產生 redux-saga middleware
  const sagaMiddleware = createSagaMiddleware();

  // 2. 產生 store並且串接 redux middleware
  const store = isDev
    ? compose(
        applyMiddleware(sagaMiddleware, logger)
        // window && window.devToolsExtension && window.devToolsExtension(),
      )(createStore)(reducers)
    : applyMiddleware(sagaMiddleware)(createStore)(reducers);

  // 3. 執行middleware
  sagaMiddleware.run(rootSaga);
  return store;
};

export default configureStore;
