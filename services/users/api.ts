import { mutate } from "swr";
import { MutationFetcher } from "swr/mutation";
import { mutations } from "@/shared/lib/http";
import { parseToString } from "@/shared/lib/helper";

import {
  CreateUserFormSchema,
  UserSchema,
  UpdateUserFormSchema,
  CreateUserResponse,
} from "./schema";

interface GetUserPathnameProps {
  id?: string;
  isMe?: boolean;
}

export const getUserPathname = ({ id, isMe }: GetUserPathnameProps = {}) => {
  const pathname = "/users";

  if (id) {
    return `${pathname}/${parseToString(id)}`;
  }

  if (isMe) {
    return `${pathname}/me`;
  }

  return pathname;
};

export const refetchUsers = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return (
      typeof pathname === "string" && pathname.startsWith(getUserPathname())
    );
  });
};

interface UserAPIType {
  create: MutationFetcher<CreateUserResponse, string, CreateUserFormSchema>;
  update: MutationFetcher<UserSchema, string, UpdateUserFormSchema>;
}

const userAPI: UserAPIType = {
  create: mutations.post,
  update: mutations.put,
};

export default userAPI;
