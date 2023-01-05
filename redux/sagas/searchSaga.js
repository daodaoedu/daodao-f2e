import { put, call, takeEvery } from 'redux-saga/effects';
// import { get } from "../../utils/REST";

function* loadNextSearchResult(action) {
  const { body } = action.payload;
  const URL = `https://api.daoedu.tw/notion/databases`;
  try {
    const result = yield fetch(URL, {
      method: 'POST',
      body: JSON.stringify(body),
    }).then((res) => res.json());
    yield put({
      type: 'NEXT_SEARCH_RESULT_SUCCESS',
      payload: result?.payload ?? {},
    });
  } catch (error) {
    yield put({ type: 'NEXT_SEARCH_RESULT_FAILURE', error });
  }
}

function* loadSearchResult(action) {
  const { body } = action.payload;
  const URL = `https://api.daoedu.tw/notion/databases`;
  try {
    const result = yield fetch(URL, {
      method: 'POST',
      body: JSON.stringify(body),
    }).then((res) => res.json());

    yield put({
      type: 'SEARCH_RESULT_SUCCESS',
      payload: result?.payload ?? {},
    });
  } catch (error) {
    yield put({ type: 'SEARCH_RESULT_FAILURE', error });
  }
}

function* categorySaga() {
  yield takeEvery('SEARCH_RESULT', loadSearchResult);
  yield takeEvery('NEXT_SEARCH_RESULT', loadNextSearchResult);
}

export default categorySaga;
