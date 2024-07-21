import { all } from 'redux-saga/effects';
import searchSaga from './searchSaga';
import userSaga from './user';
import partnerSaga from './partnersSaga';
import sharedSaga from './sharedSaga';
import resourceSaga from './resourceSaga';
import groupSaga from './groupSaga';
import autoLogoutSaga from './autoLogoutSaga';

export default function* rootSaga() {
  yield all([
    autoLogoutSaga(),
    searchSaga(),
    userSaga(),
    sharedSaga(),
    resourceSaga(),
    groupSaga(),
    partnerSaga(),
  ]);
}
