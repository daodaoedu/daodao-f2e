import { put, takeLatest, select } from 'redux-saga/effects';
import { AREAS } from '@/constants/areas';
import { CATEGORIES } from '@/constants/category';
import { EDUCATION_STEP } from '@/constants/member';
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

  const urlSearchParams = new URLSearchParams({ pageSize });
  const searchParamsOptions = {
    area: AREAS,
    category: CATEGORIES,
    partnerEducationStep: EDUCATION_STEP,
    isGrouping: true,
    search: true,
  };

  Object.keys(searchParamsOptions).forEach((key) => {
    const searchParam = query[key];
    const option = searchParamsOptions[key];

    if (!searchParam || !option) return;

    if (Array.isArray(option)) {
      urlSearchParams.append(
        key,
        searchParam
          .split(',')
          .filter((item) => option.some((_option) => _option.label === item))
          .join(','),
      );
    } else {
      urlSearchParams.append(key, searchParam);
    }
  });

  const URL = `${GROUP_API_URL}?${urlSearchParams.toString()}`;

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
