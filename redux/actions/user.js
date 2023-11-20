export function userLogin() {
  return {
    type: 'USER_LOGIN',
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
