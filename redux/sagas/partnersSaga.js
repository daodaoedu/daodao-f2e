import { put, takeEvery } from 'redux-saga/effects';

function* fetchAllPartners() {
  try {
    const URL = `${process.env.NEXT_PUBLIC_API_URL}/user/all_User`;
    const result = yield fetch(URL).then((res) => res.json());
    yield put({ type: 'FETCH_ALL_PARTNERS_SUCCESS', payload: result });
  } catch (error) {
    yield put({ type: 'FETCH_ALL_PARTNERS_FAILURE' });
  }
}

function* userSaga() {
  yield takeEvery('FETCH_ALL_PARTNERS', fetchAllPartners);
}

export default userSaga;
