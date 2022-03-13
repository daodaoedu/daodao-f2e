import { all } from "redux-saga/effects";
import searchSaga from "./searchSaga";
import userSaga from "./userSaga";

export default function* rootSaga() {
  yield all([searchSaga(), userSaga()]);
}
