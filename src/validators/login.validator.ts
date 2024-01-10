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
    errorMessage: 'Password is required!',
    notEmpty: true
  }
});
