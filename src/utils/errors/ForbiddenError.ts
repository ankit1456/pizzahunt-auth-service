import { Forbidden } from 'http-errors';

export default class ForbiddenError extends Forbidden {
  constructor(message = 'You are not authorized to perform this operation') {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
