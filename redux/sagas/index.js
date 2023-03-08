import { all } from 'redux-saga/effects';
import searchSaga from './searchSaga';
import userSaga from './userSaga';
import sharedSaga from './sharedSaga';
import resourceSaga from './resourceSaga';

export default function* rootSaga() {
  yield all([searchSaga(), userSaga(), sharedSaga(), resourceSaga()]);
}
