export const DEFAULT_PAGE_SIZE = 6;
export const SET_PAGE_SIZE = 'SET_PAGE_SIZE';
export const SET_QUERY = 'SET_QUERY';
export const GET_GROUP_ITEMS_SUCCESS = 'GET_GROUP_ITEMS_SUCCESS';
export const GET_GROUP_ITEMS_FAILURE = 'GET_GROUP_ITEMS_FAILURE';
export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://daodao-server.onrender.com';
export const GROUP_API_URL = `${BASE_API_URL}/activity`;

export function setPageSize(pageSize) {
  return {
    type: SET_PAGE_SIZE,
    payload: {
      pageSize,
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

export function getGroupItemsSuccess({ data = [], totalCount = 0 } = {}) {
  return {
    type: GET_GROUP_ITEMS_SUCCESS,
    payload: {
      items: data,
      total: totalCount,
    },
  };
}

export function getGroupItemsError(payload) {
  return { type: GET_GROUP_ITEMS_FAILURE, payload };
}
