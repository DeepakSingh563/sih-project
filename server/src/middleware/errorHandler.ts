import { Request, Response, NextFunction } from "express";

/** Wrap an async route handler so thrown/rejected errors reach errorHandler
 *  instead of crashing the process. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[error] ${req.method} ${req.path}:`, err?.message || err);
  const status = err?.status || 500;
  res.status(status).json({
    error: err?.publicMessage || "Something went wrong. Please try again.",
  });
}
