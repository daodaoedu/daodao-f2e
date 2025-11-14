import type { components } from './openapi-types';

type ApiErrorResponse =
  components['schemas']['api-response.validators_apiErrorResponseSchema'];

export class ApiError<
  T extends ApiErrorResponse['error'] = ApiErrorResponse['error'],
> extends Error {
  public readonly status: number;

  public readonly data?: T;

  constructor(status: number, message: string, data?: T) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
