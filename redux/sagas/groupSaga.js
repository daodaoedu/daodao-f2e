import { put, takeLatest, select } from 'redux-saga/effects';
import req from '@/utils/request';

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
    const response = yield req(URL);
    yield put(getGroupItemsSuccess(response));
  } catch (error) {
    yield put(getGroupItemsError(error));
  }
}

function* groupSaga() {
  yield takeLatest([SET_PAGE_SIZE, SET_QUERY], getGroupItems);
}

export default groupSaga;
