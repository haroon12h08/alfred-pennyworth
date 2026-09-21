# ADR-002: LangGraph orchestration with policy before side effects

## Context

Alfred must pause controlled work and cannot delegate authority to a model.

## Decision

The supervisor is a typed LangGraph state machine: understand, load context, plan, policy check, interrupt for approval, execute, verify, persist, report. `PolicyEvaluator` is a framework-independent port returning `ALLOW`, `REQUIRE_APPROVAL`, or `DENY`; LangGraph's interrupt/resume mechanism is used only after that deterministic decision.

## Consequences

The initial planner is intentionally deterministic and limited. A future model-backed planner can be introduced behind the same graph and tool contracts without becoming the policy authority.
