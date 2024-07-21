import { put, delay, takeEvery, select } from 'redux-saga/effects';
import { CHECK_LOGIN_VALIDITY, userLogout } from '../actions/user';

// 6hr
const MAX_TIME = 6 * 60 * 60 * 1000;

function* autoLogout() {
  const user = yield select(state => state.user);
  const validityTime = user.lastLogin + MAX_TIME - Date.now();

  if (validityTime <= 0 || Number.isNaN(validityTime)) {
    yield put(userLogout());
  }

  yield delay(validityTime);

  if (user.token) {
    yield put(userLogout());
  }
}

function* autoLogoutSaga() {
  yield takeEvery(CHECK_LOGIN_VALIDITY, autoLogout);
}

export default autoLogoutSaga;
