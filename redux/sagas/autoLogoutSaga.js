import { put, take, delay } from 'redux-saga/effects';
import { userLogout } from '../actions/user';

function* autoLogoutSaga() {
  while (true) {
    const action = yield take('FETCH_USER_BY_ID_SUCCESS');
    yield delay(1000 * 60 * 60 * 6);
    // Check if the login timestamp + 6 hours is still less than the current time
    if (action.payload.lastLogin + 1000 * 60 * 60 * 6 <= Date.now()) {
      yield put(userLogout());
    }
  }
}

export default autoLogoutSaga;
