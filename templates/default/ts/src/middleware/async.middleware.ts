import { type NextFunction, type Request, type Response } from "express";

const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;