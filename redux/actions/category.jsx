export function loadNotionTable(categoryId, query) {
  return {
    type: 'REQUEST_LOAD_NOTION_TABLE',
    payload: {
      categoryId, query,
    },
  };
}

export function loadNotionPage() {
  return {
    type: 'REQUEST_NOTION_PAGE',
  };
}
