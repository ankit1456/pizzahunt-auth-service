import { DEFAULT_PAGE_SIZE } from '@utils/constants';
import { checkSchema as validationSchema } from 'express-validator';

export default validationSchema(
  {
    page: {
      toInt: true,
      customSanitizer: {
        options: (value: number) => (Number.isNaN(value) ? 1 : value)
      }
    },
    limit: {
      toInt: true,
      customSanitizer: {
        options: (value: number) =>
          Number.isNaN(value) ? DEFAULT_PAGE_SIZE : value
      }
    },
    q: {
      trim: true,
      customSanitizer: {
        options: (value: string) => value ?? ''
      }
    },
    role: {
      trim: true,
      customSanitizer: {
        options: (value: string) => value ?? ''
      }
    }
  },
  ['query']
);
