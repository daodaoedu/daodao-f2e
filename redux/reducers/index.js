import { combineReducers } from "redux";
import search from "./search";
import user from "./user";
import theme from "./theme";
import shared from "./shared";

const allReducers = combineReducers({
  search,
  user,
  theme,
  shared,
});

export default allReducers;
