import type { Action, Approval, Evidence, Founder, PlannedAction, Task } from "../../../../packages/domain/src/index.js";
import type { FounderRequest } from "../../../../packages/schemas/src/index.js";
export interface AlfredResponse { taskId: string; status: Task["status"]; answer: string; actions: Action[]; evidence: Evidence[]; approvals: Approval[]; errors: Array<{ code: string; message: string }>; }
export interface AlfredRuntime { executeTask(request: FounderRequest): Promise<AlfredResponse>; resumeTask(input: { taskId: string; approvalId: string; approved: boolean }): Promise<AlfredResponse>; }
export interface AlfredGraphState { request: FounderRequest; task?: Task; founder?: Founder; context: { memoryIds: string[]; freshness: string }; evidence: Evidence[]; plannedActions: PlannedAction[]; executedActions: Action[]; approvals: Approval[]; errors: Array<{ code: string; message: string }>; finalResponse?: string; }
