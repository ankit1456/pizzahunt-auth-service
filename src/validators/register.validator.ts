import { checkSchema as validationSchema } from 'express-validator';

export default validationSchema({
  email: {
    notEmpty: {
      errorMessage: 'Email is required'
    },
    trim: true,
    isEmail: {
      errorMessage: 'Not a valid email'
    }
  }
});
