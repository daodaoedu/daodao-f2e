import { put, call, takeEvery } from 'redux-saga/effects';

function* getFacebookGroupPost(action) {
  const { numOfPosts } = action.payload;
  const URL = `https://api.daoedu.tw/facebook/group/posts/${numOfPosts || 6}`;
  try {
    const result = yield fetch(URL, {
      method: 'GET',
    }).then((res) => res.json());
    yield put({
      type: 'GET_FACEBOOK_GROUP_POST_SUCCESS',
      payload: result?.payload?.data ?? {},
    });
  } catch (error) {
    yield put({ type: 'GET_FACEBOOK_GROUP_POST_FAILURE', error });
  }
}

function* getFacebookFansPagePost(action) {
  const { numOfPosts } = action.payload;
  const URL = `https://api.daoedu.tw/facebook/fanspage/posts/${
    numOfPosts || 6
  }`;
  try {
    const result = yield fetch(URL, {
      method: 'GET',
    }).then((res) => res.json());
    yield put({
      type: 'GET_FACEBOOK_FANSPAGE_POST_SUCCESS',
      payload: result?.payload?.data ?? {},
    });
  } catch (error) {
    yield put({ type: 'GET_FACEBOOK_FANSPAGE_POST_FAILURE', error });
  }
}

function* getInstagramPost() {
  const URL = `https://api.daoedu.tw/facebook/instagram/media/id%2Cmedia_type%2Cmedia_url`;
  try {
    const result = yield fetch(URL, {
      method: 'GET',
    }).then((res) => res.json());
    yield put({
      type: 'GET_INSTAGAM_POST_SUCCESS',
      payload: result?.payload?.data ?? {},
    });
  } catch (error) {
    yield put({ type: 'GET_INSTAGRAM_POST_FAILURE', error });
  }
}

function* getInstagramStory() {
  const URL = `https://api.daoedu.tw/facebook/instagram/stories/id%2Cmedia_type%2Cmedia_url`;
  try {
    const result = yield fetch(URL, {
      method: 'GET',
    }).then((res) => res.json());
    yield put({
      type: 'GET_INSTAGAM_STORY_SUCCESS',
      payload: result?.payload?.data ?? {},
    });
  } catch (error) {
    yield put({ type: 'GET_INSTAGRAM_STORY_FAILURE', error });
  }
}
function* sharedSaga() {
  yield takeEvery('GET_FACEBOOK_GROUP_POST', getFacebookGroupPost);
  yield takeEvery('GET_FACEBOOK_FANSPAGE_POST', getFacebookFansPagePost);
  yield takeEvery('GET_INSTAGRAM_POST', getInstagramPost);
  yield takeEvery('GET_INSTAGRAM_STORY', getInstagramStory);
}

export default sharedSaga;
