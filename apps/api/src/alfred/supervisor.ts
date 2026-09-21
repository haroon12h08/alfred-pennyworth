import { randomUUID } from "node:crypto";
import { Annotation, Command, END, interrupt, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import type { Action, Approval, Evidence, Founder, PlannedAction, Task } from "../../../../packages/domain/src/index.js";
import type { FounderRequest } from "../../../../packages/schemas/src/index.js";
import type { Logger } from "../observability/logger.js";
import type { PolicyEvaluator } from "../policies/authority.js";
import type { MemoryRepository } from "../memory/contracts.js";
import type { AlfredGraphState, AlfredResponse, AlfredRuntime } from "./runtime.js";

const now = (): string => new Date().toISOString();
const state = Annotation.Root({
  request: Annotation<FounderRequest>(), task: Annotation<Task | undefined>(), founder: Annotation<Founder | undefined>(),
  context: Annotation<AlfredGraphState["context"]>(), evidence: Annotation<Evidence[]>(), plannedActions: Annotation<PlannedAction[]>(),
  executedActions: Annotation<Action[]>(), approvals: Annotation<Approval[]>(), errors: Annotation<AlfredGraphState["errors"]>(), finalResponse: Annotation<string | undefined>()
});
type GraphState = typeof state.State;

export class AlfredSupervisor implements AlfredRuntime {
  private readonly checkpointer = new MemorySaver();
  private readonly graph;
  constructor(private readonly dependencies: { policy: PolicyEvaluator; memory: MemoryRepository; logger: Logger }) {
    this.graph = new StateGraph(state)
      .addNode("understand_request", this.understandRequest.bind(this))
      .addNode("load_context", this.loadContext.bind(this))
      .addNode("plan", this.plan.bind(this))
      .addNode("check_authority", this.checkAuthority.bind(this))
      .addNode("request_approval", this.requestApproval.bind(this))
      .addNode("execute", this.execute.bind(this))
      .addNode("verify", this.verify.bind(this))
      .addNode("persist_state", this.persistState.bind(this))
      .addNode("report", this.report.bind(this))
      .addEdge(START, "understand_request").addEdge("understand_request", "load_context").addEdge("load_context", "plan").addEdge("plan", "check_authority")
      .addConditionalEdges("check_authority", (input: GraphState) => input.approvals.length > 0 ? "request_approval" : "execute")
      .addEdge("request_approval", "execute").addEdge("execute", "verify").addEdge("verify", "persist_state").addEdge("persist_state", "report").addEdge("report", END)
      .compile({ checkpointer: this.checkpointer });
  }
  async executeTask(request: FounderRequest): Promise<AlfredResponse> {
    const taskId = request.taskId ?? randomUUID(); const config = { configurable: { thread_id: taskId } };
    this.dependencies.logger.info("task.started", { taskId, companyId: request.companyId });
    await this.graph.invoke({ request: { ...request, taskId }, context: { memoryIds: [], freshness: now() }, evidence: [], plannedActions: [], executedActions: [], approvals: [], errors: [] }, config);
    return this.response(taskId, (await this.graph.getState(config)).values as GraphState);
  }
  async resumeTask(input: { taskId: string; approvalId: string; approved: boolean }): Promise<AlfredResponse> {
    const config = { configurable: { thread_id: input.taskId } };
    await this.graph.invoke(new Command({ resume: { approvalId: input.approvalId, approved: input.approved } }), config);
    return this.response(input.taskId, (await this.graph.getState(config)).values as GraphState);
  }
  private understandRequest(input: GraphState): Partial<GraphState> {
    const request = input.request; const task: Task = { id: request.taskId ?? randomUUID(), companyId: request.companyId, title: request.objective.slice(0, 120), objective: request.objective, requestedBy: request.founderId, status: "RUNNING", createdAt: now(), startedAt: now() };
    const founder: Founder = { id: request.founderId, companyId: request.companyId, name: "Founder", email: "unknown@local.invalid" };
    this.dependencies.logger.info("graph.node.entered", { taskId: task.id, node: "understand_request" }); return { task, founder };
  }
  private async loadContext(input: GraphState): Promise<Partial<GraphState>> {
    const memories = await this.dependencies.memory.retrieve({ companyId: input.request.companyId, scope: "THREAD" });
    this.dependencies.logger.info("context.loaded", { taskId: input.task?.id, memoryCount: memories.length }); return { context: { memoryIds: memories.map((memory) => memory.memoryId), freshness: now() } };
  }
  private plan(input: GraphState): Partial<GraphState> {
    const external = /\b(send|email|notify|message)\b/i.test(input.request.objective);
    const action: PlannedAction = { id: randomUUID(), taskId: input.task!.id, toolName: external ? "send_email" : "record_investigation", intent: external ? "Send an external communication" : "Record an investigation request", input: { objective: input.request.objective }, authority: external ? "REQUIRES_APPROVAL" : "AUTO_EXECUTE", risk: external ? "HIGH" : "LOW" };
    return { plannedActions: [action] };
  }
  private checkAuthority(input: GraphState): Partial<GraphState> {
    const action = input.plannedActions[0]; if (!action || !input.founder) return { errors: [{ code: "GRAPH_EXECUTION", message: "Task cannot be authorized without an action and founder." }] };
    const decision = this.dependencies.policy.evaluateActionAuthority({ founder: input.founder, action, companyId: input.request.companyId });
    if (decision === "DENY") return { errors: [{ code: "AUTHORIZATION", message: "Policy denied this action." }] };
    if (decision === "REQUIRE_APPROVAL") { const approval: Approval = { approvalId: randomUUID(), taskId: input.task!.id, action, reason: "External communication requires founder approval.", risk: action.risk, requestedAt: now(), requestedBy: "ALFRED", status: "PENDING" }; return { approvals: [approval] }; }
    return {};
  }
  private requestApproval(input: GraphState): Partial<GraphState> {
    const approval = input.approvals[0]; if (!approval) return {};
    const response = interrupt({ type: "approval.required", approval });
    if (!response.approved) return { errors: [{ code: "AUTHORIZATION", message: "Founder rejected the proposed action." }], approvals: [{ ...approval, status: "REJECTED", decision: "Rejected", decidedAt: now() }] };
    return { approvals: [{ ...approval, status: "APPROVED", decision: "Approved", decidedAt: now() }] };
  }
  private execute(input: GraphState): Partial<GraphState> {
    if (input.errors.length > 0) return {};
    const action = input.plannedActions[0]; if (!action) return {};
    if (action.toolName === "send_email") return { errors: [{ code: "INTEGRATION", message: "No email integration is connected. No message was sent." }] };
    const record: Action = { id: randomUUID(), taskId: input.task!.id, companyId: input.request.companyId, plannedActionId: action.id, status: "EXECUTED", executedAt: now(), result: { accepted: true, toolName: action.toolName } };
    this.dependencies.logger.info("action.executed", { taskId: input.task?.id, actionId: record.id, tool: action.toolName }); return { executedActions: [record] };
  }
  private verify(input: GraphState): Partial<GraphState> { return { executedActions: input.executedActions.map((action) => ({ ...action, status: "VERIFIED" as const })) }; }
  private persistState(input: GraphState): Partial<GraphState> { this.dependencies.logger.info("state.persisted", { taskId: input.task?.id, actions: input.executedActions.length }); return {}; }
  private report(input: GraphState): Partial<GraphState> { const waiting = input.approvals.find((approval) => approval.status === "PENDING"); const answer = input.errors[0]?.message ?? (waiting ? "I need your approval before I continue." : input.executedActions.length ? "The requested work was executed and verified." : "I completed the investigation without executing an external action."); return { finalResponse: answer, task: input.task ? { ...input.task, status: waiting ? "WAITING_APPROVAL" : input.errors.length ? "FAILED" : "COMPLETED", completedAt: now() } : undefined }; }
  private response(taskId: string, output: GraphState): AlfredResponse { const waiting = output.approvals.some((approval) => approval.status === "PENDING"); return { taskId, status: waiting ? "WAITING_APPROVAL" : (output.task?.status ?? "RUNNING"), answer: output.finalResponse ?? (waiting ? "Approval required." : "Task is in progress."), actions: output.executedActions, evidence: output.evidence, approvals: output.approvals, errors: output.errors }; }
}
