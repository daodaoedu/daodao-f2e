import { all } from 'redux-saga/effects';
import userSaga from './user';
import marathonSaga from './marathon';
import partnerSaga from './partnersSaga';

export default function* rootSaga() {
  yield all([
    userSaga(),
    partnerSaga(),
    marathonSaga()
  ]);
}
