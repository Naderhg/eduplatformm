import { Request, Response, NextFunction, RequestHandler } from 'express';

interface AsyncFunction {
  (req: Request, res: Response, next: NextFunction): Promise<any>;
}

const asyncHandler = (fn: AsyncFunction): RequestHandler => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
