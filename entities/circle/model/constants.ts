/**
 * Circle 常數與型別別名
 * 提供更友善的型別名稱
 */

import type {
  CircleValidatorsCircleUserSchema,
  CircleValidatorsCircleSchema,
  CircleValidatorsCircleListResponseSchema,
  CircleValidatorsCircleDetailResponseSchema,
  CircleValidatorsCircleFormSchema,
  CircleValidatorsCircleSearchParamsSchema,
  CircleValidatorsCircleIdObjectSchema,
} from '../generated/models';

// 型別別名 - 使用明確的後綴區分 Type 與 Component
export type CircleUserData = CircleValidatorsCircleUserSchema;
export type CircleData = CircleValidatorsCircleSchema;
export type CircleListResponse = CircleValidatorsCircleListResponseSchema;
export type CircleDetailResponse = CircleValidatorsCircleDetailResponseSchema;
export type CircleFormValues = CircleValidatorsCircleFormSchema;
export type CircleSearchParams = CircleValidatorsCircleSearchParamsSchema;
export type CircleIdObject = CircleValidatorsCircleIdObjectSchema;
