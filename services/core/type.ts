export type PaginationRequestType<T> = {
  page?: number;
  pageSize?: number;
} & T;

export type PaginationResponseType<T> = {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
