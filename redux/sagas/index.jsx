import { all } from 'redux-saga/effects';
import categorySaga from './categorySaga';

export default function* rootSaga() {
  yield all([
    categorySaga(),
  ]);
}
