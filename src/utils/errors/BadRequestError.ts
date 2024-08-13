import { BadRequest } from 'http-errors';

export default class BadRequestError extends BadRequest {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
