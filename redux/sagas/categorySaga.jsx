import { put, call, takeEvery } from 'redux-saga/effects';
import { get } from '../../utils/REST';

function* fetchCategoryList(action) {
  const { categoryId, query } = action.payload;
  const queryString = `${query.tags ? `${`?tags=${query.tags}`}` : ''}`;
  const url = `https://api.daoedu.tw/notion/databases/${categoryId}${queryString}`;
  try {
    const result = yield call(get, url);
    yield put({ type: 'LOAD_NOTION_TABLE', payload: result.payload });
  } catch (error) {
    yield put({ type: 'LOAD_NOTION_TABLE_FAILURE', message: error });
  }
}

function* fetchPageData(action) {
  const { pageId } = action.payload;
  const url = `https://api.daoedu.tw/notion/pages/${pageId}`;
  try {
    const result = yield call(get, url);
    yield put({ type: 'LOAD_NOTION_PAGE', payload: result.payload });
  } catch (error) {
    yield put({ type: 'LOAD_NOTION_PAGE_FAILURE', message: error });
  }
}

function* categorySaga() {
  yield takeEvery('REQUEST_LOAD_NOTION_TABLE', fetchCategoryList);
  yield takeEvery('REQUEST_NOTION_PAGE', fetchPageData);
}

export default categorySaga;
