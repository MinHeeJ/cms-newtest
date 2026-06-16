import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class SiteCreationError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "SiteCreationError";
    this.status = status;
    this.code = code;
  }
}

export function apiJson<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function createdJson<T>(data: T) {
  return apiJson(data, { status: 201 });
}

export function acceptedJson<T>(data: T) {
  return apiJson(data, { status: 202 });
}

export function errorJson(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      error: {
        code,
        message
      }
    },
    { status }
  );
}

export function toApiError(error: unknown) {
  if (error instanceof SiteCreationError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      code: "VALIDATION_FAILED",
      message: error.issues.map((issue) => issue.message).join("; ")
    };
  }

  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "The site creation request could not be completed."
  };
}

export function handleApiError(error: unknown) {
  const mapped = toApiError(error);
  return errorJson(mapped.status, mapped.code, mapped.message);
}
