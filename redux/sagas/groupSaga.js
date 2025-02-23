import { put, takeLatest, select } from 'redux-saga/effects';
import { AREAS, ONLINE_OPTION, TBD_OPTION } from '@/constants/areas';
import { ACTIVITY_CATEGORIES, CATEGORIES } from '@/constants/category';
import { EDUCATION } from '@/constants/member';
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
    area: [AREAS.concat(ONLINE_OPTION, TBD_OPTION), 'label', 'value'],
    category: [CATEGORIES, 'label', 'value'],
    activityCategory: [ACTIVITY_CATEGORIES, 'label', 'value'],
    partnerEducationStep: [EDUCATION, 'label', 'value'],
    isGrouping: true,
    search: true,
  };

  Object.keys(searchParamsConfigs).forEach((key) => {
    const searchParam = query[key];
    const config = searchParamsConfigs[key];

    if (!searchParam || !config) return;

    if (Array.isArray(config)) {
      const [options, optionKey, valueKey] = config;

      urlSearchParams.append(
        key,
        searchParam
          .split(",")
          .map(
            (item) =>
              options.find((_option) => _option[optionKey] === item)?.[
                valueKey ?? optionKey
              ]
          )
          .filter(Boolean)
          .join(",")
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
