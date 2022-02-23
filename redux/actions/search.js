export function loadSearchResult(body) {
  return {
    type: "SEARCH_RESULT",
    payload: {
      body,
    },
  };
}

export function loadNextSearchResult(body) {
  // 需把 start_cursor 放入body
  return {
    type: "NEXT_SEARCH_RESULT",
    payload: {
      body,
    },
  };
}
