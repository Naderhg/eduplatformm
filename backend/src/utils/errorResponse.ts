class ErrorResponse extends Error {
  statusCode: number;
  data?: any;
  
  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    
    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ErrorResponse.prototype);
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorResponse);
    }
  }
  
  // Static method to create a validation error response
  static validationError(errors: any[]) {
    return new ErrorResponse('Validation failed', 400, { errors });
  }
}

export default ErrorResponse;
