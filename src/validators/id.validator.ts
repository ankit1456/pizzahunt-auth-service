import { checkSchema as validationSchema } from 'express-validator';

const validateId = validationSchema({
  userId: {
    in: ['params'],
    isUUID: {
      errorMessage: 'not a valid id'
    }
  }
});

export default validateId;
