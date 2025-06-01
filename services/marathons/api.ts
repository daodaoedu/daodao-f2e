import { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/utils/helper";
import { mutations } from "@/utils/http";

import {
  MarathonSchema,
  CreateMarathonSchema,
  UpdateMarathonSchema,
  MarathonQuerySchema,
} from "./schema";

export type MarathonSWRKey = string | [string, MarathonQuerySchema];

interface GetMarathonPathnameProps {
  id?: string;
}

export const getMarathonPathname = ({ id }: GetMarathonPathnameProps = {}) =>
  id ? `/marathons/${parseToString(id)}` : "/marathons";

interface MarathonAPIType {
  create: MutationFetcher<MarathonSchema, MarathonSWRKey, CreateMarathonSchema>;

  update: MutationFetcher<
    MarathonSchema,
    MarathonSWRKey,
    UpdateMarathonSchema & { id: string }
  >;
}

const marathonAPI: MarathonAPIType = {
  create: (_key: string, { arg }: { arg: CreateMarathonSchema }) =>
    mutations.post<MarathonSchema>(getMarathonPathname(), arg),

  update: (
    _key: string,
    { arg }: { arg: UpdateMarathonSchema & { id: string } }
  ) => {
    const { id, ...data } = arg;
    return mutations.put<MarathonSchema>(getMarathonPathname({ id }), data);
  },
};

export default marathonAPI;
