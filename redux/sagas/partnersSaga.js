import { put, takeEvery } from 'redux-saga/effects';

function* fetchPartnersResource(action) {
  const { pageSize = 10, page = 1, ...rest } = action.payload;

  const startParams = `page=${page}&pageSize=${pageSize}`;
  const searchKey = ['educationStage', 'roleList', 'location', 'tag', 'search'];

  const queryStr = Object.entries(rest).reduce((acc, [key, val]) => {
    return val && searchKey.includes(key) ? `${acc}&${key}=${val}` : acc;
  }, startParams);

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://daodao-server.onrender.com';
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

function* partnerSaga() {
  yield takeEvery('FETCH_PARTNERS', fetchPartnersResource);
}

export default partnerSaga;
