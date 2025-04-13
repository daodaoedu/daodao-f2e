import { all } from 'redux-saga/effects';
import userSaga from './user';

export default function* rootSaga() {
  yield all([
    userSaga(),
  ]);
}
