# ADR-003: PostgreSQL migrations for durable company state

## Context

Company state, task lifecycle, actions, approvals, events, decisions, commitments, and memory cannot live in browser storage or be created implicitly at startup.

## Decision

PostgreSQL is the system of record. The repository includes explicit SQL migrations and a migration runner; startup does not run migrations. Persistence is accessed through narrow repository interfaces so the agent runtime does not know database details.

## Consequences

A PostgreSQL instance is required for production and integration tests. The first in-memory memory adapter is explicitly a test/development adapter, not a source of truth.
