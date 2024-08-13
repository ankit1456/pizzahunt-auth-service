import { RequestHandler, Request, Response, NextFunction } from 'express';

const catchAsync = (requestHandler: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};
export default catchAsync;
