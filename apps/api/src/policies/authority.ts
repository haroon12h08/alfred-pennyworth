import type { ActionAuthority, Founder, PlannedAction } from "../../../../packages/domain/src/index.js";
export type AuthorityDecision = "ALLOW" | "REQUIRE_APPROVAL" | "DENY";
export interface PolicyContext { founder: Founder; action: PlannedAction; companyId: string; }
export interface PolicyEvaluator { evaluateActionAuthority(context: PolicyContext): AuthorityDecision; }
export class DefaultPolicyEvaluator implements PolicyEvaluator {
  evaluateActionAuthority({ action }: PolicyContext): AuthorityDecision {
    if (action.authority === "BLOCKED" || action.risk === "CRITICAL") return "DENY";
    if (action.authority === "REQUIRES_APPROVAL" || action.risk === "HIGH") return "REQUIRE_APPROVAL";
    return "ALLOW";
  }
}
export const authorityFor = (toolName: string): ActionAuthority => toolName === "send_email" ? "REQUIRES_APPROVAL" : "AUTO_EXECUTE";
