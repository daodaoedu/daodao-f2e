import { put, takeEvery, select } from 'redux-saga/effects';
import {
  SET_LIMIT,
  SET_QUERY,
  getGroupItemsError,
  getGroupItemsSuccess,
} from '../actions/group';

function* getGroupItems() {
  const {
    group: { limit, query },
  } = yield select();
  const queryString = new URLSearchParams({ ...query, limit }).toString();
  const URL = `/api/group?${queryString}`;
  try {
    const response = yield fetch(URL).then((res) => res.json());
    yield put(getGroupItemsSuccess(response));
  } catch (error) {
    yield put(getGroupItemsError(error));
  }
}

function* groupSaga() {
  yield takeEvery([SET_LIMIT, SET_QUERY], getGroupItems);
}

export default groupSaga;
