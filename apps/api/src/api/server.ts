import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { ApprovalDecisionSchema, FounderRequestSchema } from "../../../../packages/schemas/src/index.js";
import type { AlfredRuntime } from "../alfred/runtime.js";
const json = (response: ServerResponse, status: number, body: unknown): void => { response.writeHead(status, { "content-type": "application/json" }); response.end(JSON.stringify(body)); };
const body = async (request: IncomingMessage): Promise<unknown> => { let value = ""; for await (const chunk of request) value += String(chunk); return value ? JSON.parse(value) : {}; };
export const createApiServer = (runtime: AlfredRuntime) => createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/health") return json(response, 200, { status: "ok" });
    if (request.method === "POST" && request.url === "/v1/tasks") { const input = FounderRequestSchema.parse(await body(request)); return json(response, 202, await runtime.executeTask(input)); }
    const approvalMatch = request.url?.match(/^\/v1\/tasks\/([^/]+)\/approvals$/);
    if (request.method === "POST" && approvalMatch?.[1]) { const input = ApprovalDecisionSchema.parse(await body(request)); if (input.approvalId.length === 0) return json(response, 400, { error: { code: "VALIDATION", message: "approvalId is required." } }); return json(response, 200, await runtime.resumeTask({ taskId: approvalMatch[1], approvalId: input.approvalId, approved: input.decision === "APPROVED" })); }
    return json(response, 404, { error: { code: "NOT_FOUND", message: "Route not found." } });
  } catch (error) { const message = error instanceof Error ? error.message : "Invalid request."; return json(response, 400, { error: { code: "VALIDATION", message } }); }
});
