export const mapToTable = (map = []) =>
  map.reduce((acc, item) => ({ ...acc, [item.key]: item.label }), {});
