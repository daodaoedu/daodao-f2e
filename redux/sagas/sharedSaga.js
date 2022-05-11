import { put, call, takeEvery } from "redux-saga/effects";

function* getFacebookGroupPost(action) {
  const { numOfPosts } = action.payload;
  const URL = `https://api.daoedu.tw/facebook/group/posts/${
    numOfPosts || 5
  }`;
  try {
    const result = yield fetch(URL, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
    yield put({
      type: "GET_FACEBOOK_GROUP_POST_SUCCESS",
      payload: result?.payload?.data ?? {},
    });
  } catch (error) {
    yield put({ type: "GET_FACEBOOK_GROUP_POST_FAILURE", error });
  }
}

function* getFacebookFansPagePost(action) {
  const { numOfPosts } = action.payload;
  const URL = `https://api.daoedu.tw/facebook/fanspage/posts/${numOfPosts || 5}`;
  try {
    const result = yield fetch(URL, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
    yield put({
      type: "GET_FACEBOOK_FANSPAGE_POST_SUCCESS",
      payload: result?.payload?.data ?? {},
    });
  } catch (error) {
    yield put({ type: "GET_FACEBOOK_FANSPAGE_POST_FAILURE", error });
  }
}

function* sharedSaga() {
    yield takeEvery("GET_FACEBOOK_GROUP_POST", getFacebookGroupPost);
  yield takeEvery("GET_FACEBOOK_FANSPAGE_POST", getFacebookFansPagePost);
    
}

export default sharedSaga;
