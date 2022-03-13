import { combineReducers } from "redux";
import search from "./search";
import user from "./user";

const allReducers = combineReducers({
  search,
  user,
});

export default allReducers;
