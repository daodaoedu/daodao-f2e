const fn = () => undefined;

export default function createStorage<T>(key: string, storage = localStorage) {
  if (!storage) return { set: fn, get: fn, remove: fn };

  const remove = () => storage.removeItem(key);
  const set = (value: T) => storage.setItem(key, JSON.stringify(value));
  const get = (): T | undefined => {
    try {
      return JSON.parse(storage.getItem(key) || 'undefined');
    } catch {
      return undefined;
    }
  };

  return { set, get, remove };
}

export const getTokenStorage = () => createStorage<string>('_token');
export const getRedirectionStorage = () => createStorage<string>('_r');
export const getTrustWebsitesStorage = () => createStorage<string[]>('_trustWeb');
export const getReminderStorage = () => createStorage<number>('_reminder');
export const getMarathonErrorsStorage = () => createStorage('_marathonFormErrors');
