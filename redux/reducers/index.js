import { combineReducers } from 'redux';
import search from './search';
import user from './user';
import resource from './resource';
import group from './group';
import partners from './partners';
import marathon from './marathon';

const allReducers = combineReducers({
  search,
  user,
  resource,
  group,
  partners,
  marathon,
});

export default allReducers;
