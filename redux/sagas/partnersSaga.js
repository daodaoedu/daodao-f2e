import { put, takeEvery } from 'redux-saga/effects';

const BASEURL = 'https://daodao-server.onrender.com';

function* fetchPartnersResource(action) {
  const { pageSize = 10, page = 1, ...rest } = action.payload;

  const startParams = `page=${page}&pageSize=${pageSize}`;
  const searchKey = ['educationStage', 'roleList', 'location', 'tag', 'search'];

  const queryStr = Object.entries(rest).reduce((acc, [key, val]) => {
    return val && searchKey.includes(key) ? `${acc}&${key}=${val}` : acc;
  }, startParams);

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || BASEURL;
    const URL = `${baseUrl}/user?${queryStr}`;
    const result = yield fetch(URL).then((res) => res.json());
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || BASEURL;
    const URL = `${baseUrl}/user/${id}`;
    const result = yield fetch(URL).then((res) => res.json());
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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || BASEURL;
    const URL = `${baseUrl}/email`;
    const result = yield fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...action.payload,
      }),
    }).then((res) => res.json());
    yield put({
      type: 'SEND_EMAIL_TO_PARTNER_SUCCESS',
    });
  } catch (error) {
    yield put({ type: 'SEND_EMAIL_TO_PARTNER_FAILURE' });
  }
}

function* partnerSaga() {
  yield takeEvery('FETCH_PARTNERS', fetchPartnersResource);
  yield takeEvery('FETCH_PARTNER_BY_ID', fetchPartnerById);
  yield takeEvery('SEND_EMAIL_TO_PARTNER', sendEmailToPartner);
}

export default partnerSaga;
