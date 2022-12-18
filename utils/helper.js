export const mapToTable = (map = []) =>
  map.reduce((acc, item) => ({ ...acc, [item.label]: item.value }), {});
