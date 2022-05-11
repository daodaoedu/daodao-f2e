export function getFacebookFansPagePost(numOfPosts) {
  return {
    type: "GET_FACEBOOK_FANSPAGE_POST",
    payload: {
      numOfPosts,
    },
  };
}

export function getFacebookGroupPost(numOfPosts) {
  return {
    type: "GET_FACEBOOK_GROUP_POST",
    payload: {
      numOfPosts,
    },
  };
}
