export function fetchPartners({ pageSize = 10, page = 1, ...rest } = {}) {
  return {
    type: 'FETCH_PARTNERS',
    payload: {
      page,
      pageSize,
      ...rest,
    },
  };
}
