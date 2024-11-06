import { checkSchema as validationSchema } from 'express-validator';

const idValidator = (paramName: string) => {
  return validationSchema({
    [paramName]: {
      in: ['params'],
      isUUID: {
        errorMessage: `${paramName} is not valid`
      }
    }
  });
};

export default idValidator;
