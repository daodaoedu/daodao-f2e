import { combineReducers } from 'redux';
import search from './search';
import user from './user';
import theme from './theme';
import shared from './shared';
import resource from './resource';
import partners from './partners';

const allReducers = combineReducers({
  search,
  user,
  theme,
  shared,
  resource,
  partners,
});

export default allReducers;
