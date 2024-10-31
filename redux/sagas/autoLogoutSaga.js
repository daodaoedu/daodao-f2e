import { put, delay, takeEvery, select } from 'redux-saga/effects';
import { CHECK_LOGIN_VALIDITY, userLogout } from '../actions/user';

function* autoLogout() {
  const user = yield select((state) => state.user);
  // depending on whether the user is already registered or not
  // setting tokenExpiry time after fetching user
  const validityTime = user.tokenExpiry - Date.now();

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
