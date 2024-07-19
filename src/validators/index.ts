import { updateUserValidator, validateUserId } from './user.validator';
import { updateTenantValidator, validateTenantId } from './tenant.validator';

export {
  updateTenantValidator,
  updateUserValidator,
  validateTenantId,
  validateUserId
};
export { default as loginValidator } from './login.validator';
export { default as queryParamsValidator } from './queryParams.validator';
export { default as registerValidator } from './register.validator';
export { default as tenantValidator } from './tenant.validator';
export { default as userValidator } from './user.validator';
