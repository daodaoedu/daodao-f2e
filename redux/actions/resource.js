// For resource page API request

export function loadRelatedResources(body) {
  return {
    type: "LOAD_RELATED_RESOURCES",
    payload: {
      body,
    },
  };
}
