import { NotFound } from 'http-errors';

export default class NotFoundError extends NotFound {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
