import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, Result, ValidationError } from 'express-validator';
import ErrorResponse from '../utils/errorResponse';

interface FormattedValidationError {
  field: string;
  message: string;
}

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => {
      if ('path' in error) {
        return {
          field: error.path || 'unknown',
          message: error.msg,
        };
      }
      return {
        field: 'unknown',
        message: error.msg,
      };
    });
    return next(ErrorResponse.validationError(errorMessages));
  }
  next();
};

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    validateRequest(req, res, next);
  };
};

export default validateRequest;
