import { combineReducers } from 'redux';
import user from './user';
import marathon from './marathon';

const allReducers = combineReducers({
  user,
  marathon,
});

export default allReducers;
