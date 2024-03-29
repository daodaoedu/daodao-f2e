import { put, takeEvery, select } from 'redux-saga/effects';
import {
  GROUP_API_URL,
  SET_PAGE_SIZE,
  SET_QUERY,
  getGroupItemsError,
  getGroupItemsSuccess,
} from '../actions/group';

function* getGroupItems() {
  const {
    group: { pageSize, query },
  } = yield select();
  const queryString = new URLSearchParams({ ...query, pageSize }).toString();
  const URL = `${GROUP_API_URL}?${queryString}`;
  try {
    const response = yield fetch(URL).then((res) => res.json());
    yield put(getGroupItemsSuccess(response));
  } catch (error) {
    yield put(getGroupItemsError(error));
  }
}

function* groupSaga() {
  yield takeEvery([SET_PAGE_SIZE, SET_QUERY], getGroupItems);
}

export default groupSaga;
