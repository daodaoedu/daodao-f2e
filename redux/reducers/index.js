import { combineReducers } from 'redux';
import search from './search';
import user from './user';
import theme from './theme';
import resource from './resource';
import group from './group';
import partners from './partners';
import marathon from './marathon';

const allReducers = combineReducers({
  search,
  user,
  theme,
  resource,
  group,
  partners,
  marathon,
});

export default allReducers;
