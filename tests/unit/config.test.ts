import { describe, expect, it } from "vitest";
import { loadEnvironment } from "../../packages/config/src/index.js";
describe("configuration", () => { it("fails clearly when tracing has no key", () => expect(() => loadEnvironment({ DATABASE_URL: "postgres://localhost/alfred", LANGSMITH_TRACING: "true" })).toThrow(/LANGSMITH_API_KEY/)); it("loads a valid development environment", () => expect(loadEnvironment({ DATABASE_URL: "postgres://localhost/alfred", LANGSMITH_TRACING: "false" }).PORT).toBe(3001)); });
