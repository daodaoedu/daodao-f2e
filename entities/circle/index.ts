// Server-side data fetching
export { getCircleData, getCircleDataKey } from './lib/get-circle-data';
export {
  getCircleListData,
  getCircleListDataKey,
} from './lib/get-circle-list-data';

// Client-side hooks
export { useCircle } from './lib/use-circle';
export { useCircleList } from './lib/use-circle-list';

// Data mutation utilities
export {
  mutateCircleData,
  mutateAllCircleData,
} from './lib/mutate-circle-data';

// Generated API hooks - Infinite scroll support
export {
  useGetApiV1CirclesInfinite,
  getGetApiV1CirclesInfiniteKeyLoader,
} from './generated/api/circles.client';

// Generated API hooks - Standard hooks
export {
  useGetApiV1Circles,
  useGetApiV1CirclesId,
  getGetApiV1CirclesKey,
  getGetApiV1CirclesIdKey,
} from './generated/api/circles.client';

export type {
  CircleUserData,
  CircleData,
  CircleListResponse,
  CircleDetailResponse,
  CircleFormValues,
  CircleSearchParams,
  CircleIdObject,
} from './model';

export {
  circleSearchParamsSchema,
  circleUserSchema,
  circleSchema,
  circleFormSchema,
} from './model/schemas';
