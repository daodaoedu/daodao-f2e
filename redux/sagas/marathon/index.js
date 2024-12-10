import { put, takeEvery, call } from "redux-saga/effects";
import { BASE_URL } from "@/constants/common";
import req from "@/utils/request";

function* fetchMarathonProfileByUserId(action) {
  const { userId } = action.payload;
  try {
    const URL = `${BASE_URL}/marathon?userId=${userId}`;

    const result = yield req(URL);
    yield put({
      type: "FETCH_MARATHON_PROFILE_BY_USER_ID_SUCCESS",
      payload: result.data,
    });
  } catch (error) {
    console.log(error);
    yield put({ type: "FETCH_MARATHON_PROFILE_BY_USER_ID_FAILURE" });
  }
}

function* fetchMarathonProfileByUserEvent(action) {
  const { userId, eventId } = action.payload;
  try {
    const URL = `${BASE_URL}/marathon?userId=${userId}&eventId=${eventId}`;

    const result = yield req(URL);
    yield put({
      type: "FETCH_MARATHON_PROFILE_BY_USER_EVENT_SUCCESS",
      payload: result.data && result.data[0]
    });
  } catch (error) {
    console.log(error);
    yield put({ type: "FETCH_MARATHON_PROFILE_BY_USER_EVENT_FAILURE" });
  }
}

function* fetchMarathonProfileById(action) {
  const { id } = action.payload; // marathon._id
  try {
    const URL = `${BASE_URL}/marathon/${id}`;

    const result = yield req(URL);
    yield put({
      type: "FETCH_MARATHON_PROFILE_BY_ID_SUCCESS",
      payload: result.data,
    });
  } catch (error) {
    console.log(error);
    yield put({ type: "FETCH_MARATHON_PROFILE_BY_ID_FAILURE" });
  }
}
function* createMarathonProfileByToken(action) {
  const { token, marathon } = action.payload;
  try {
    const URL = `${BASE_URL}/marathon`;

    const result = yield req(URL, {
      method: "POST",
      body: JSON.stringify({
        ...marathon,
      }),
    });

    yield put({
      type: "CREATE_MARATHON_PROFILE_BY_TOKEN_SUCCESS",
      payload: { token, ...result.data },
    });
  } catch (error) {
    console.log(error);
    yield put({ type: "CREATE_MARATHON_PROFILE_BY_TOKEN_FAILURE" });
  }
}

function* updateMarathonProfile(action) {
  const { id, marathon } = action.payload;

  try {
    const URL = `${BASE_URL}/marathon/${id}`;

    const result = yield req(URL, {
      method: "PUT",
      body: JSON.stringify({
        ...marathon,
      }),
    });

    yield put({
      type: "UPDATE_MARATHON_PROFILE_SUCCESS",
      payload: result.data,
    });
  } catch (error) {
    yield put({ type: "UPDATE_MARATHON_PROFILE_FAILURE" });
  } finally {
    yield new Promise((res) => setTimeout(res, 300));
    yield put({ type: "UPDATE_MARATHON_PROFILE_API_STATE_RESET" });
  }
}

function* deleteMarathonProfile(action) {
  const { id } = action.payload;

  try {
    const URL = `${BASE_URL}/marathon/${id}`;

    const result = yield req(URL, {
      method: "DELETE",
      body: JSON.stringify({
        id,
      }),
    });
    yield put({
      type: "DELETE_MARATHON_PROFILE_SUCCESS",
      payload: result.data,
    });
  } catch (error) {
    yield put({ type: "DELETE_MARATHON_PROFILE_FAILURE" });
  } finally {
    yield new Promise((res) => setTimeout(res, 300));
    yield put({ type: "DELETE_MARATHON_PROFILE_API_STATE_RESET" });
  }
}

function* marathonSaga() {
  yield takeEvery("FETCH_MARATHON_PROFILE_BY_ID", fetchMarathonProfileById);
  yield takeEvery("FETCH_MARATHON_PROFILE_BY_USER_EVENT", fetchMarathonProfileByUserEvent);
  yield takeEvery("CREATE_MARATHON_PROFILE_BY_TOKEN", createMarathonProfileByToken);
  yield takeEvery("UPDATE_MARATHON_PROFILE", updateMarathonProfile);
  yield takeEvery("DELETE_MARATHON_PROFILE", deleteMarathonProfile);
  yield takeEvery("FETCH_MARATHON_PROFILE_BY_USER_ID", fetchMarathonProfileByUserId);
}

export default marathonSaga;
