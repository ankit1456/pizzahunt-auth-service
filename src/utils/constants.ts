export const enum EStatus {
  SUCCESS = 'success',
  FAIL = 'fail',
  ERROR = 'error'
}

export const enum ERoles {
  CUSTOMER = 'customer',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export const roles: ERoles[] = [ERoles.CUSTOMER, ERoles.MANAGER, ERoles.ADMIN];

export const DEFAULT_PAGE_SIZE = 8;
export const API_ROUTE_PREFIX = '/api/auth';
