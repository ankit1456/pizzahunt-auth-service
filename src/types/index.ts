export type TPaginatedQuery = {
  page: number;
  limit: number;
};

export type TQueryParams = TPaginatedQuery & {
  role?: string;
};
