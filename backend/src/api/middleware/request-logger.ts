import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    requestId: string;
  }
}

export async function attachRequestLogger(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const incomingRequestId = request.headers["x-request-id"];
    request.requestId = Array.isArray(incomingRequestId) ? incomingRequestId[0] : incomingRequestId ?? randomUUID();
    reply.header("x-request-id", request.requestId);
  });

  app.addHook("onResponse", async (request, reply) => {
    request.log.info(
      {
        requestId: request.requestId,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode
      },
      "request completed"
    );
  });
}
