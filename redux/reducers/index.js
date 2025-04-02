import { combineReducers } from 'redux';
import user from './user';
import group from './group';
import partners from './partners';
import marathon from './marathon';

const allReducers = combineReducers({
  user,
  group,
  partners,
  marathon,
});

export default allReducers;
