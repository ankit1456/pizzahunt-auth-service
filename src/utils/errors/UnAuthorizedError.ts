import { UnauthorizedError as UnauthorizedErrorExpressJwt } from 'express-jwt';

export default class UnAuthorizedError extends UnauthorizedErrorExpressJwt {
  constructor(message = 'You are not logged in. Please log in and try again') {
    super('credentials_required', { message });
    this.inner.message = message;
    Object.setPrototypeOf(this, UnAuthorizedError.prototype);
  }
}
