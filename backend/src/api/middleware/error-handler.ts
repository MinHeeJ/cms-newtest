import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Array<Record<string, unknown>>
  ) {
    super(message);
  }
}

export function badRequest(message: string, details?: Array<Record<string, unknown>>): ApiError {
  return new ApiError(400, "BAD_REQUEST", message, details);
}

export function forbidden(message = "권한이 없습니다."): ApiError {
  return new ApiError(403, "FORBIDDEN", message);
}

export function notFound(message = "대상을 찾을 수 없습니다."): ApiError {
  return new ApiError(404, "NOT_FOUND", message);
}

export function conflict(message: string): ApiError {
  return new ApiError(409, "CONFLICT", message);
}

export function validationError(message: string, details?: Array<Record<string, unknown>>): ApiError {
  return new ApiError(422, "VALIDATION_ERROR", message, details);
}

type HandledError = Error & { statusCode?: number };

export async function errorHandler(error: HandledError, _request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (error instanceof ZodError) {
    await reply.status(400).send({
      code: "BAD_REQUEST",
      message: "요청 값을 확인해 주세요.",
      details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
    });
    return;
  }

  if (error instanceof ApiError) {
    await reply.status(error.statusCode).send({
      code: error.code,
      message: error.message,
      details: error.details
    });
    return;
  }

  const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
  await reply.status(statusCode).send({
    code: statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
    message: statusCode >= 500 ? "요청을 처리하는 중 문제가 발생했습니다." : error.message
  });
}
