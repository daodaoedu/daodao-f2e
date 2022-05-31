import { put, call, takeEvery } from "redux-saga/effects";

function* loadRelatedResources(action) {
  const { body } = action.payload;
  const URL = `https://api.daoedu.tw/notion/databases`;
  try {
    const result = yield fetch(URL, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
    yield put({
      type: "LOAD_RELATED_RESOURCES_SUCCESS",
      payload: result?.payload ?? {},
    });
  } catch (error) {
    yield put({ type: "LOAD_RELATED_RESOURCES_FAILURE", error });
  }
}

function* categorySaga() {
  yield takeEvery("LOAD_RELATED_RESOURCES", loadRelatedResources);
}

export default categorySaga;

