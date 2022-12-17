import { put, call, takeEvery } from 'redux-saga/effects';
import * as localForage from 'localforage';
// import { get } from "../../utils/REST";
import firebase from '../../utils/firebase';

function* checkUserStatus(action) {
  //   const { body } = action.payload;
  try {
    const userData = yield localForage.getItem('userData');
    const { displayName, email, photoURL } = userData.user;
    // const { refreshToken, accessToken, expirationTime } =
    //   userData.user.stsTokenManager;
    yield put({
      type: 'CHECK_USER_ACCOUNT_SUCCESS',
      payload: {
        name: displayName,
        email,
        photoURL,
      },
    });
  } catch (error) {
    yield put({ type: 'CHECK_USER_ACCOUNT_FAILURE', error });
  }
}

function* userLogin(action) {
  //   const { body } = action.payload;
  try {
    const userData = yield firebase.signInWithGoogle();
    console.log('=====>', userData);
    localforage.setItem('userData', userData);
    const { displayName, email, photoURL } = userData.user;
    // const { refreshToken, accessToken, expirationTime } =
    //   userData.user.stsTokenManager;
    yield put({
      type: 'USER_LOGIN_SUCCESS',
      payload: {
        name: displayName,
        email,
        photoURL,
      },
    });
  } catch (error) {
    yield put({ type: 'USER_LOGIN_FAILURE', error });
  }
}

function* userSaga() {
  yield takeEvery('CHECK_USER_ACCOUNT', checkUserStatus);
  yield takeEvery('USER_LOGIN', userLogin);
}

export default userSaga;
