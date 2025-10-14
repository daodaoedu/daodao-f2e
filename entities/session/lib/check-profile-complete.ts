import { SessionState } from '../model/types';

export const checkProfileComplete = (data: SessionState['user']) => {
  if (!data) return false;

  const hasAnySocialCode = Object.values(data.contactList || '{}').some(
    (socialCode) => Boolean(socialCode)
  );
  if (!hasAnySocialCode) return false;

  const keys = [
    'name',
    'birthDay',
    'gender',
    'roleList',
    'wantToDoList',
    'tagList',
    'selfIntroduction',
  ] as const;

  return keys.every((key) =>
    Boolean(Array.isArray(data[key]) ? data[key].length : data[key])
  );
};
