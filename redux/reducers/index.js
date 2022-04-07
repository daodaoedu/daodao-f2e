import { combineReducers } from "redux";
import search from "./search";
import user from "./user";
import theme from "./theme";

const allReducers = combineReducers({
  search,
  user,
  theme,
});

export default allReducers;
