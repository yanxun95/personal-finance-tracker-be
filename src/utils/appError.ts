export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, errorCode: ErrorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400, "VALIDATION_ERROR");
  }

  static unauthorized(message: string): AppError {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message: string): AppError {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static notFound(message: string): AppError {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409, "CONFLICT");
  }

  static internal(message: string): AppError {
    return new AppError(message, 500, "INTERNAL_ERROR");
  }
}

