const fn = () => undefined;

export default function createStorage(key, storage = localStorage) {
  if (!storage) return { set: fn, get: fn, remove: fn };

  const remove = () => storage.removeItem(key);
  const set = (value) => storage.setItem(key, JSON.stringify(value));
  const get = () => {
    try {
      return JSON.parse(storage.getItem(key) || 'undefined');
    } catch {
      return undefined;
    }
  };

  return { set, get, remove };
}

export const getRedirectionStorage = () => createStorage('_redirection');
