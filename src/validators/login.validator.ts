import { checkSchema as validationSchema } from 'express-validator';

export default validationSchema({
  email: {
    trim: true,
    notEmpty: {
      errorMessage: 'email is required'
    },
    isEmail: {
      errorMessage: 'email is not valid'
    }
  },
  password: {
    trim: true,
    notEmpty: {
      errorMessage: 'password is required'
    }
  }
});
