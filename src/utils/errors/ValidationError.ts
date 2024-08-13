import { ValidationError as TExpressValidationError } from 'express-validator';
import { BadRequest } from 'http-errors';

export default class ValidationError extends BadRequest {
  constructor(public errors: TExpressValidationError[]) {
    super('Validation Failed');
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
