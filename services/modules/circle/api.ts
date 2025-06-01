import { MutationFetcher } from "swr/mutation";
import { mutations, parseToString } from "@/services/core";

import { CircleSchema, CreateCircleSchema, UpdateCircleSchema } from "./schema";

export type CircleSWRKey = string;

interface GetCirclePathnameProps {
  id?: string;
}

export const getCirclePathname = ({ id }: GetCirclePathnameProps = {}) =>
  id ? `/circles/${parseToString(id)}` : "/circles";

interface CircleAPIType {
  create: MutationFetcher<CircleSchema, CircleSWRKey, CreateCircleSchema>;
  update: MutationFetcher<CircleSchema, CircleSWRKey, UpdateCircleSchema>;
  delete: MutationFetcher<void, CircleSWRKey, Required<GetCirclePathnameProps>>;
}

const circleAPI: CircleAPIType = {
  create: (_, { arg }) =>
    mutations.post<CircleSchema>(getCirclePathname(), arg),

  update: (_, { arg: { _id: id, ...arg } }) =>
    mutations.put<CircleSchema>(getCirclePathname({ id }), arg),

  delete: (_, { arg }) => mutations.delete<void>(getCirclePathname(arg)),
};

export default circleAPI;
