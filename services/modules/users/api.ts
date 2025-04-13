import { MutationFetcher } from 'swr/mutation';
import { apiPaths, mutations } from '@/services/core';

import { CreateUserRequest, IUser, UpdateUserRequest } from './schema';

export type UserSWRKey = string;

export interface UserMeQueryParams {
  token: string | null;
  onSuccess?: (user: IUser) => void;
  onError?: (error: Error) => void;
}

interface GetUserPathnameProps {
  id?: string;
  isMe?: boolean;
}

export const getUserPathname = ({ id, isMe }: GetUserPathnameProps = {}) =>
  isMe || id
    ? apiPaths.users(isMe ? 'me' : id).toString()
    : apiPaths.users().toString();

interface UserAPIType {
  create: MutationFetcher<{ user: IUser; token: string }, UserSWRKey, CreateUserRequest>;
  update: MutationFetcher<IUser, UserSWRKey, UpdateUserRequest>;
}

const userAPI: UserAPIType = {
  create: (_, { arg }) =>
    mutations.post<{ user: IUser; token: string }>(getUserPathname(), arg),

  update: (_, { arg }) =>
    mutations.put<IUser>(getUserPathname({ id: arg.id }), arg),
};

export default userAPI;
