export function fetchMarathonProfileById(id) {
  return {
    type: 'FETCH_MARATHON_PROFILE_BY_ID',
    payload: {
      id,
    },
  };
}

export function createMarathonProfileByToken(token, marathon) {
  return {
    type: 'CREATE_MARATHON_PROFILE_BY_TOKEN',
    payload: {
      token,
      marathon
    }
  };
}

export function updateMarathonProfile(token, id, marathon) {
  return {
    type: 'UPDATE_MARATHON_PROFILE',
    payload: {
      token,
      id,
      marathon
    }
  };
}

export function deleteMarathonProfile(token, id) {
  return {
    type: 'DELETE_MARATHON_PROFILE',
    payload: {
      token,
      id
    }
  };
}

export function fetchMarathonProfileByUserId(userId) {
  return {
    type: 'FETCH_MARATHON_PROFILE_BY_USER_ID',
    payload: {
      userId
    }
  };
}

export function fetchMarathonProfileByUserEvent(userId, eventId) {
  return {
    type: "FETCH_MARATHON_PROFILE_BY_USER_EVENT",
    payload: {
      userId,
      eventId,
    },
  };
}
