import { put, takeLatest, select } from 'redux-saga/effects';
import { AREAS } from '@/constants/areas';
import { CATEGORIES } from '@/constants/category';
import { EDUCATION_STEP } from '@/constants/member';
import { activityCategoryList } from '@/constants/activityCategory';
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
  const searchParamsConfigs = {
    area: [AREAS, 'label'],
    category: [CATEGORIES, 'label'],
    activityCategory: [activityCategoryList, 'value'],
    partnerEducationStep: [EDUCATION_STEP, 'label'],
    isGrouping: true,
    search: true,
  };

  Object.keys(searchParamsConfigs).forEach((key) => {
    const searchParam = query[key];
    const config = searchParamsConfigs[key];

    if (!searchParam || !config) return;

    if (Array.isArray(config)) {
      const [options, optionKey] = config;

      urlSearchParams.append(
        key,
        searchParam
          .split(',')
          .filter((item) =>
            options.some((_option) => _option[optionKey] === item),
          )
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
