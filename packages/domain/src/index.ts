/** Framework-free business language for Alfred. */
export type EntityId = string;
export type ISODateTime = string;
export type CompanyStage = "IDEA" | "PRE_SEED" | "SEED" | "SERIES_A" | "GROWTH" | "OTHER";
export type TaskStatus = "QUEUED" | "RUNNING" | "WAITING_APPROVAL" | "COMPLETED" | "FAILED" | "CANCELLED";
export type ActionAuthority = "READ" | "DRAFT" | "AUTO_EXECUTE" | "REQUIRES_APPROVAL" | "BLOCKED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
export type EvidenceQuality = "DIRECT" | "CORROBORATED" | "INDIRECT" | "INCOMPLETE";
export type MemoryScope = "THREAD" | "COMPANY" | "FOUNDER";

export interface Founder { id: EntityId; companyId: EntityId; name: string; email: string; }
export interface Company { id: EntityId; name: string; stage: CompanyStage; industry?: string; mission?: string; }
export interface Goal { id: EntityId; companyId: EntityId; title: string; description?: string; target?: number; deadline?: ISODateTime; status: "ACTIVE" | "ACHIEVED" | "PAUSED" | "CANCELLED"; }
export interface Metric { id: EntityId; companyId: EntityId; name: string; value: number; unit: string; observedAt: ISODateTime; }
export interface Person { id: EntityId; companyId: EntityId; name: string; email?: string; role?: string; }
export interface Customer { id: EntityId; companyId: EntityId; name: string; status: "LEAD" | "ACTIVE" | "AT_RISK" | "CHURNED"; revenue?: number; }
export interface Opportunity { id: EntityId; companyId: EntityId; customerId?: EntityId; name: string; stage: "DISCOVERY" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST"; value?: number; expectedClose?: ISODateTime; }
export interface Task { id: EntityId; companyId: EntityId; title: string; status: TaskStatus; requestedBy: EntityId; objective: string; createdAt: ISODateTime; startedAt?: ISODateTime; completedAt?: ISODateTime; }
export interface Commitment { id: EntityId; companyId: EntityId; ownerId: EntityId; description: string; dueAt?: ISODateTime; status: "OPEN" | "COMPLETED" | "OVERDUE" | "CANCELLED"; source: string; }
export interface Decision { id: EntityId; companyId: EntityId; summary: string; decidedBy: EntityId; decidedAt: ISODateTime; rationale?: string; reviewAt?: ISODateTime; }
export interface Event { id: EntityId; companyId: EntityId; type: string; actor: "FOUNDER" | "ALFRED" | "INTEGRATION" | "SYSTEM"; payload: Record<string, string | number | boolean | null>; occurredAt: ISODateTime; }
export interface AgentTask { id: EntityId; companyId: EntityId; objective: string; relevantEntityIds: EntityId[]; constraints: string[]; authority: ActionAuthority; }
export interface Source { id: EntityId; kind: "USER" | "DOCUMENT" | "INTEGRATION" | "TOOL" | "SYSTEM"; label: string; uri?: string; retrievedAt: ISODateTime; }
export interface Evidence { id: EntityId; source: Source; statement: string; quality: EvidenceQuality; observedAt: ISODateTime; }
export interface PlannedAction { id: EntityId; taskId: EntityId; toolName: string; intent: string; input: Record<string, string | number | boolean | null>; authority: ActionAuthority; risk: RiskLevel; }
export interface Action { id: EntityId; taskId: EntityId; companyId: EntityId; plannedActionId: EntityId; status: "PLANNED" | "EXECUTED" | "FAILED" | "VERIFIED" | "UNKNOWN"; executedAt?: ISODateTime; result?: Record<string, string | number | boolean | null>; }
export interface ToolCall { id: EntityId; taskId: EntityId; toolName: string; inputHash: string; startedAt: ISODateTime; completedAt?: ISODateTime; status: "STARTED" | "SUCCEEDED" | "FAILED"; }
export interface Approval { approvalId: EntityId; taskId: EntityId; action: PlannedAction; reason: string; risk: RiskLevel; requestedAt: ISODateTime; requestedBy: "ALFRED"; status: ApprovalStatus; decision?: string; decidedAt?: ISODateTime; }
export interface Memory { memoryId: EntityId; companyId: EntityId; scope: MemoryScope; content: string; source: Source; confidence: number; provenance: string; createdAt: ISODateTime; updatedAt: ISODateTime; }
