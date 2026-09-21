export type ErrorCode = "VALIDATION" | "AUTHORIZATION" | "TOOL" | "INTEGRATION" | "DATABASE" | "MODEL" | "GRAPH_EXECUTION" | "APPROVAL_REQUIRED" | "VERIFICATION" | "TIMEOUT" | "RATE_LIMIT";
export class AlfredError extends Error {
  constructor(public readonly code: ErrorCode, message: string, public readonly retryable = false, public readonly userActionRequired = false, public readonly cause?: Error) { super(message); this.name = "AlfredError"; }
}
export class ValidationError extends AlfredError { constructor(message: string) { super("VALIDATION", message); } }
export class AuthorizationError extends AlfredError { constructor(message: string) { super("AUTHORIZATION", message, false, true); } }
export class ToolError extends AlfredError { constructor(message: string, retryable = false) { super("TOOL", message, retryable); } }
export class ApprovalRequiredError extends AlfredError { constructor(message: string) { super("APPROVAL_REQUIRED", message, false, true); } }
