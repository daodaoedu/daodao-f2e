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
    const URL =
      process.env.NEXT_PUBLIC_API_URL || 'https://daodao-server.onrender.com';
    const result = yield call(URL);
    yield put({ type: 'FETCH_ALL_USER_SUCCESS', payload: result });
  } catch (error) {
    yield put({ type: 'FETCH_ALL_USER_FAILURE' });
  }
}

function* updateUserProfile(action) {
  const { user } = action.payload;
  try {
    const baseUri =
      process.env.NEXT_PUBLIC_API_URL || 'https://daodao-server.onrender.com';
    const URL = `${baseUri}/user/${user.id}`;

    const result = yield fetch(URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...user,
      }),
    }).then((res) => res.json());

    yield put({ type: 'UPDATE_USER_PROFILE_SUCCESS', payload: result.data });
  } catch (error) {
    yield put({ type: 'UPDATE_USER_PROFILE_FAILURE' });
  }
}

function* fetchUserById(action) {
  const { id } = action.payload;
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://daodao-server.onrender.com';
    const URL = `${baseUrl}/user/${id}`;
    const result = yield fetch(URL).then((res) => res.json());
    yield put({
      type: 'FETCH_USER_BY_ID_SUCCESS',
      payload: result.data && result.data[0],
    });
  } catch (error) {
    console.log(error);
    yield put({ type: 'FETCH_USER_BY_ID_FAILURE' });
  }
}

function* userSaga() {
  yield takeEvery('CHECK_USER_ACCOUNT', checkUserStatus);
  yield takeEvery('USER_LOGIN', userLogin);
  yield takeEvery('FETCH_ALL_USERS', fetchAllUsers);
  yield takeEvery('UPDATE_USER_PROFILE', updateUserProfile);
  yield takeEvery('FETCH_USER_BY_ID', fetchUserById);
}

export default userSaga;
