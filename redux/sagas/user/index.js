import { put, takeEvery, call } from 'redux-saga/effects';
import * as localforage from 'localforage';
import { BASE_URL } from '@/constants/common';
import req from '@/utils/request';

/**
 *
 * @param {boolean} isnormal 是否一般 token ?
 * @returns time
 */
const handleTokenExpiry = (isnormal = false) =>
  isnormal ? Date.now() + 60 * 60 * 1000 : Date.now() + 60 * 60 * 6000;

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

function* fetchAllUsers() {
  try {
    const URL = BASE_URL;
    const result = yield call(URL);
    yield put({ type: 'FETCH_ALL_USER_SUCCESS', payload: result });
  } catch (error) {
    yield put({ type: 'FETCH_ALL_USER_FAILURE' });
  }
}

function* createUserProfile(action) {
  const { user } = action.payload;
  try {
    const URL = `${BASE_URL}/user/${user.id}`;
    // if success => status: 201, token, user
    const result = yield req(URL, {
      method: 'POST',
      body: JSON.stringify({
        ...user,
      }),
    });

    const { token, user: resultUser } = result;
    yield put({
      type: 'UPDATE_USER_PROFILE_SUCCESS',
      payload: { token, ...resultUser },
    });
  } catch (error) {
    yield put({ type: 'UPDATE_USER_PROFILE_FAILURE' });
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
  } finally {
    yield new Promise((res) => setTimeout(res, 300));
    yield put({ type: 'UPDATE_USER_PROFILE_API_STATE_RESET' });
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
        _id: id,
        ...result.data[0],
        token,
        tokenExpiry: handleTokenExpiry(true),
      },
    });
  } catch (error) {
    console.log(error);
    yield put({ type: 'FETCH_USER_BY_ID_FAILURE' });
  }
}

// fetch user data by token
function* fetchUserByToken(action) {
  const token = action.payload?.token;
  try {
    const URL = `${BASE_URL}/user/me`;
    const result = yield call(req, URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (result.data && result.data._id) {
      const marathonResponse = yield call(req, `${BASE_URL}/marathon?userId=${result.data._id}`);
      yield put({
        type: "FETCH_USER_BY_TOKEN_SUCCESS",
        payload: result.data && {
          _id: result.data._id,
          ...result.data,
          token,
          tokenExpiry: handleTokenExpiry(true),
          marathons: marathonResponse?.data || [],
        },
      });
    } else {
      yield put({
        type: "FETCH_USER_BY_TOKEN_SUCCESS_NO_DATA",
        payload: {
          ...result.data,
          tempToken: token,
          tokenExpiry: handleTokenExpiry(true),
        },
      });
    }
  } catch (error) {
    console.error("Error fetching user by token:", JSON.stringify(error));
    yield put({
      type: "FETCH_USER_BY_TOKEN_FAILURE",
      error: error.message || "Unknown error",
    });
  }
}
function* userSaga() {
  yield takeEvery('CHECK_USER_ACCOUNT', checkUserStatus);
  yield takeEvery('FETCH_ALL_USERS', fetchAllUsers);
  yield takeEvery('CREATE_USER_PROFILE', createUserProfile);
  yield takeEvery('UPDATE_USER_PROFILE', updateUserProfile);
  yield takeEvery('FETCH_USER_BY_ID', fetchUserById);
  yield takeEvery("FETCH_USER_BY_TOKEN", fetchUserByToken);
}

export default userSaga;
