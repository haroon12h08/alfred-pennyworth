import { describe, expect, it } from "vitest";
import { z } from "zod";
import { toLangChainTool } from "../../apps/api/src/tools/contracts.js";
describe("tool contract", () => it("rejects invalid input before execution", async () => { let executed = false; const definition = { name: "create_task", description: "Create a task", inputSchema: z.object({ title: z.string().min(1) }), outputSchema: z.object({ id: z.string() }), authority: "AUTO_EXECUTE" as const, risk: "LOW" as const, execute: async () => { executed = true; return { id: "task-1" }; } }; const tool = toLangChainTool(definition); await expect(tool.invoke({ title: "" })).rejects.toThrow(); expect(executed).toBe(false); }));
