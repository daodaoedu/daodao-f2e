import { all } from 'redux-saga/effects';
import userSaga from './user';
import marathonSaga from './marathon';

export default function* rootSaga() {
  yield all([
    userSaga(),
    marathonSaga()
  ]);
}
