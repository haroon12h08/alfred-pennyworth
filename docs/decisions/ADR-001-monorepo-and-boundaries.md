# ADR-001: TypeScript monorepo and dependency direction

## Context

Alfred needs a web command surface, API/runtime, shared domain language, validation, configuration and persistence without letting any delivery framework define company concepts.

## Decision

Use a TypeScript npm-workspace-shaped repository with `apps/api`, `apps/web`, and small packages for `domain`, `schemas`, `config`, `database`, and `shared`. The domain package has no imports from infrastructure or agent packages. API adapters depend inward on domain contracts.

## Alternatives

A single application package would be faster initially but would blur UI, HTTP, agent, and company-state boundaries. Separate repositories would add coordination cost before there is a real vertical slice.

## Consequences

Imports are deliberately explicit and initially verbose. The structure permits later package publishing or workspace tooling without a rewrite.
