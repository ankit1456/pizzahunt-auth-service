import { checkSchema as validationSchema } from 'express-validator';

export default validationSchema({
  email: {
    trim: true,
    notEmpty: {
      errorMessage: 'Email is required'
    },
    isEmail: {
      errorMessage: 'Not a valid email'
    }
  },
  password: {
    trim: true,
    notEmpty: {
      errorMessage: 'Password is required'
    }
  }
});
