export const mapToTable = (map = []) =>
  map.reduce(
    (acc, item) => ({ ...acc, [item.key ?? item.value]: item.label }),
    {}
  );

export const isServer = typeof window === 'undefined';
