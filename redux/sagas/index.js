import { all } from 'redux-saga/effects';
import searchSaga from './searchSaga';
import userSaga from './user';
import sharedSaga from './sharedSaga';
import resourceSaga from './resourceSaga';
import groupSaga from './groupSaga';

export default function* rootSaga() {
  yield all([
    searchSaga(),
    userSaga(),
    sharedSaga(),
    resourceSaga(),
    groupSaga(),
  ]);
}
