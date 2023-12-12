export const DEFAULT_LIMIT = 12;
export const SET_LIMIT = 'SET_LIMIT';
export const SET_QUERY = 'SET_QUERY';
export const GET_GROUP_ITEMS_SUCCESS = 'GET_GROUP_ITEMS_SUCCESS';
export const GET_GROUP_ITEMS_FAILURE = 'GET_GROUP_ITEMS_FAILURE';

export function setLimit(limit) {
  return {
    type: SET_LIMIT,
    payload: {
      limit,
    },
  };
}

export function setQuery(query = {}) {
  return {
    type: SET_QUERY,
    payload: {
      query,
    },
  };
}

export function getGroupItemsSuccess({ items = [], total = 0 } = {}) {
  return {
    type: GET_GROUP_ITEMS_SUCCESS,
    payload: {
      items,
      total,
    },
  };
}

export function getGroupItemsError(payload) {
  return { type: GET_GROUP_ITEMS_FAILURE, payload };
}
