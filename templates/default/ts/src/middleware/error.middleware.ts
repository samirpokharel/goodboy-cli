// @ts-nocheck
import { type Response, type NextFunction, type Request } from "express";
import { AppError } from "../helper/errors";
import { HTTPStatusCode } from "../config/constant";

export class ErrorMiddleware {
  public static handleError = (
    error: any,
    _: Request,
    res: Response,
    next: NextFunction
  ): void => {
    console.error(error);
    if (error instanceof AppError) {
      const { message, name, stack, validationErrors } = error;
      const statusCode = error.statusCode || HTTPStatusCode.InternalServerError;
      res.statusCode = statusCode;
      res.json({ name, message, validationErrors });
    } else if (error["name"] === "ValidationError") {
      res.status(400).json({ name: error["name"], message: error.message });
    } else {
      const name = "InternalServerError";
      const message = "An internal server error occurred";
      const statusCode = HTTPStatusCode.InternalServerError;
      res.statusCode = statusCode;
      res.json({ name, message });
    }
    next();
  };
}
