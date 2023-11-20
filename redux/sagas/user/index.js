import { put, all, take, takeEvery, select, call } from 'redux-saga/effects';
import * as localforage from 'localforage';
import firebase from '../../../utils/firebase';

function* checkUserStatus() {
  try {
    const userData = yield localforage.getItem('userData');
    const { displayName, email, photoURL } = userData.user;
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

function* userLogin() {
  try {
    const userData = yield firebase.signInWithGoogle();
    const { displayName, email, photoURL } = userData.user;
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

function* fetchAllUsers() {
  try {
    const URL = process.env.NEXT_PUBLIC_API_URL;
    const result = yield call(URL);
    yield put({ type: 'FETCH_ALL_USER_SUCCESS', payload: result });
  } catch (error) {
    yield put({ type: 'FETCH_ALL_USER_FAILURE' });
  }
}

function* userSaga() {
  yield takeEvery('CHECK_USER_ACCOUNT', checkUserStatus);
  yield takeEvery('USER_LOGIN', userLogin);
  yield takeEvery('FETCH_ALL_USERS', fetchAllUsers);
}

export default userSaga;
