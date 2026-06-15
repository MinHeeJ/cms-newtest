import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (message = "요청한 리소스를 찾을 수 없습니다.") =>
  new ApiError(404, "NOT_FOUND", message);

export const badRequest = (message: string, details?: Record<string, unknown>) =>
  new ApiError(400, "BAD_REQUEST", message, details);

export const conflict = (message: string, details?: Record<string, unknown>) =>
  new ApiError(409, "CONFLICT", message, details);

export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "입력값을 확인해 주세요.",
      details: { issues: error.flatten() }
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({
      code: error.code,
      message: error.message,
      details: error.details
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "서버 오류가 발생했습니다."
  });
};
