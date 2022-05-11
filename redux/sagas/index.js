import { all } from "redux-saga/effects";
import searchSaga from "./searchSaga";
import userSaga from "./userSaga";
import sharedSaga from "./sharedSaga";

export default function* rootSaga() {
  yield all([searchSaga(), userSaga(), sharedSaga()]);
}
