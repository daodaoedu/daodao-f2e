import { put, takeEvery } from 'redux-saga/effects';
import { BASE_URL } from '@/constants/common';
import req from '@/utils/request';

function* fetchPartnersResource(action) {
  const { pageSize = 10, page = 1, ...rest } = action.payload;

  const startParams = `page=${page}&pageSize=${pageSize}`;
  const searchKey = ['educationStage', 'roleList', 'location', 'tag', 'search'];

  const queryStr = Object.entries(rest).reduce((acc, [key, val]) => {
    return val && searchKey.includes(key) ? `${acc}&${key}=${val}` : acc;
  }, startParams);

  try {
    const URL = `${BASE_URL}/user?${queryStr}`;
    const result = yield req(URL);
    yield put({
      type:
        page !== 1 ? 'FETCH_PARTNERS_MORE_SUCCESS' : 'FETCH_PARTNERS_SUCCESS',
      payload: {
        data: result.data,
        pagination: {
          pageSize: +result.pageSize || 10,
          page: +result.page,
          totalPages: +result.totalPages,
          totalCount: +result.totalCount,
        },
      },
    });
  } catch (error) {
    yield put({ type: 'FETCH_PARTNERS_FAILURE' });
  }
}

function* fetchPartnerById(action) {
  const { id } = action.payload;
  try {
    const URL = `${BASE_URL}/user/${id}`;
    const result = yield req(URL);
    yield put({
      type: 'FETCH_PARTNER_BY_ID_SUCCESS',
      payload: result.data && result.data[0],
    });
  } catch (error) {
    yield put({ type: 'FETCH_PARTNER_BY_ID_FAILURE' });
  }
}

function* sendEmailToPartner(action) {
  try {
    const URL = `${BASE_URL}/email`;
    yield req(URL, {
      method: 'POST',
      body: JSON.stringify({
        ...action.payload,
      }),
    });
    yield put({
      type: 'SEND_EMAIL_TO_PARTNER_SUCCESS',
    });
  } catch (error) {
    console.log(error);
    yield put({ type: 'SEND_EMAIL_TO_PARTNER_FAILURE' });
  }
}

function* partnerSaga() {
  yield takeEvery('FETCH_PARTNERS', fetchPartnersResource);
  yield takeEvery('FETCH_PARTNER_BY_ID', fetchPartnerById);
  yield takeEvery('SEND_EMAIL_TO_PARTNER', sendEmailToPartner);
}

export default partnerSaga;
