import { all } from 'redux-saga/effects';
import searchSaga from './searchSaga';
import userSaga from './user';
import marathonSaga from './marathon';
import partnerSaga from './partnersSaga';
import resourceSaga from './resourceSaga';
import groupSaga from './groupSaga';

export default function* rootSaga() {
  yield all([
    searchSaga(),
    userSaga(),
    resourceSaga(),
    groupSaga(),
    partnerSaga(),
    marathonSaga()
  ]);
}
