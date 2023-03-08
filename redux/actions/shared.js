export function getFacebookFansPagePost(numOfPosts) {
  return {
    type: 'GET_FACEBOOK_FANSPAGE_POST',
    payload: {
      numOfPosts,
    },
  };
}

export function getFacebookGroupPost(numOfPosts) {
  return {
    type: 'GET_FACEBOOK_GROUP_POST',
    payload: {
      numOfPosts,
    },
  };
}

export function getInstagramPost() {
  return {
    type: 'GET_INSTAGRAM_POST',
    payload: {},
  };
}

export function getInstagramStory() {
  return {
    type: 'GET_INSTAGRAM_STORY',
    payload: {},
  };
}
