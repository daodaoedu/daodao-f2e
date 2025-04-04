import { combineReducers } from 'redux';
import user from './user';
import partners from './partners';
import marathon from './marathon';

const allReducers = combineReducers({
  user,
  partners,
  marathon,
});

export default allReducers;
