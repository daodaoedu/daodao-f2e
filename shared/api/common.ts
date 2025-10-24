export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError<T = unknown> extends Error {
  public readonly status: number;

  public readonly data?: T;

  constructor(status: number, message: string, data?: T) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
