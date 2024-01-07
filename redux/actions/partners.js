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

export function fetchPartnerById({ id } = {}) {
  return {
    type: 'FETCH_PARTNER_BY_ID',
    payload: {
      id,
    },
  };
}
