import { all } from 'redux-saga/effects';
import userSaga from './user';
import marathonSaga from './marathon';
import partnerSaga from './partnersSaga';
import groupSaga from './groupSaga';

export default function* rootSaga() {
  yield all([
    userSaga(),
    groupSaga(),
    partnerSaga(),
    marathonSaga()
  ]);
}
