import { Request } from 'express';

export type TQueryParams = {
  page: number;
  limit: number;
  q: string;
  role: string;
};

export interface TGenericBodyRequest<T> extends Request {
  body: T;
}

export const enum EStatus {
  SUCCESS = 'success',
  FAIL = 'fail',
  ERROR = 'error'
}
