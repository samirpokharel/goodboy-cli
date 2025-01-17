import { HTTPStatusCode } from "../config/constant";

export interface ValidationType {
  fields: string[];
  constraint: string;
}

interface AppErrorArgs {
  name?: string;
  statusCode: HTTPStatusCode;
  message: string;
  isOperational?: boolean;
  validationErrors?: ValidationType[];
}

export class AppError extends Error {
  public readonly name: string;
  public readonly statusCode: HTTPStatusCode;
  public readonly isOperational: boolean = true;
  public readonly validationErrors?: ValidationType[];

  constructor(args: AppErrorArgs) {
    const { name, statusCode, message, isOperational, validationErrors } = args;
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name ?? "ApplicationError";
    this.statusCode = statusCode;
    if (isOperational !== undefined) this.isOperational = isOperational;
    this.validationErrors = validationErrors;
    Error.captureStackTrace(this);
  }

  static badRequest(
    message: string,
    validationErrors?: ValidationType[]
  ): AppError {
    return new AppError({
      name: "BadRequestError",
      message,
      statusCode: HTTPStatusCode.BadRequest,
      validationErrors,
    });
  }

  static unauthorized(message: string): AppError {
    return new AppError({
      name: "UnauthorizedError",
      message,
      statusCode: HTTPStatusCode.Unauthorized,
    });
  }

  static forbidden(message: string): AppError {
    return new AppError({
      name: "ForbiddenError",
      message,
      statusCode: HTTPStatusCode.Forbidden,
    });
  }

  static notFound(message: string): AppError {
    return new AppError({
      name: "NotFoundError",
      message,
      statusCode: HTTPStatusCode.NotFound,
    });
  }

  static internalServer(message: string): AppError {
    return new AppError({
      name: "InternalServerError",
      message,
      statusCode: HTTPStatusCode.InternalServerError,
    });
  }
}