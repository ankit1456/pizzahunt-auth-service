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
