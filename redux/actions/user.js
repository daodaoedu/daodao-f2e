export function userLogin() {
  return {
    type: 'USER_LOGIN',
  };
}

export function userLogout() {
  return {
    type: 'USER_LOGOUT',
  };
}

export function checkUserAccount() {
  return {
    type: 'CHECK_USER_ACCOUNT',
  };
}

export function fetchAllUsers() {
  return {
    type: 'FETCH_ALL_USERS',
  };
}

export function fetchUserById(id) {
  return {
    type: 'FETCH_USER_BY_ID',
    payload: {
      id,
    },
  };
}

export function addResourceToCollection(resourceId) {
  return {
    type: 'ADD_RESOURCE_TO_COLLECTION',
    payload: {
      resourceId,
    },
  };
}

export function removeResourceFromCollection(resourceId) {
  return {
    type: 'REMOVE_RESOURCE_FROM_COLLECTION',
    payload: {
      resourceId,
    },
  };
}

export function updateUser(user) {
  return {
    type: 'UPDATE_USER_PROFILE',
    payload: {
      user,
    },
  };
}
