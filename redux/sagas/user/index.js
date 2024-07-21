import { put, all, take, takeEvery, select, call } from 'redux-saga/effects';
import * as localforage from 'localforage';
import firebase from '../../../utils/firebase';
import { BASE_URL } from '@/constants/common';
import req from '@/utils/request';

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
    const URL = BASE_URL;
    const result = yield call(URL);
    yield put({ type: 'FETCH_ALL_USER_SUCCESS', payload: result });
  } catch (error) {
    yield put({ type: 'FETCH_ALL_USER_FAILURE' });
  }
}

function* updateUserProfile(action) {
  const { user } = action.payload;
  try {
    const URL = `${BASE_URL}/user/${user.id}`;

    const result = yield req(URL, {
      method: 'PUT',
      body: JSON.stringify({
        ...user,
      }),
    });

    yield put({ type: 'UPDATE_USER_PROFILE_SUCCESS', payload: result.data });
  } catch (error) {
    yield put({ type: 'UPDATE_USER_PROFILE_FAILURE' });
  }
}

// fetch user data by id with header auth token
function* fetchUserById(action) {
  const { id, token } = action.payload;
  try {
    const URL = `${BASE_URL}/user/${id}`;
    const result = yield req(URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    yield put({
      type: 'FETCH_USER_BY_ID_SUCCESS',
      payload: result.data && {
        ...result.data[0],
        token,
        lastLogin: Date.now(),
      },
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
