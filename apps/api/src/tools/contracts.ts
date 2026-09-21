import { tool } from "@langchain/core/tools";
import type { z } from "zod";
import type { ActionAuthority, RiskLevel } from "../../../../packages/domain/src/index.js";
import { ToolError } from "../errors.js";
export interface VerificationStrategy<Output> { verify(output: Output): Promise<{ verified: boolean; detail: string }>; }
export interface ToolDefinition<Input extends z.ZodObject, Output extends z.ZodType> {
  name: string; description: string; inputSchema: Input; outputSchema: Output; authority: ActionAuthority; risk: RiskLevel;
  execute(input: z.infer<Input>): Promise<z.infer<Output>>; verification?: VerificationStrategy<z.infer<Output>>;
}
export const toLangChainTool = <Input extends z.ZodObject, Output extends z.ZodType>(definition: ToolDefinition<Input, Output>) => tool(async (input) => {
  const parsedInput = definition.inputSchema.safeParse(input);
  if (!parsedInput.success) throw new ToolError(`Invalid input for ${definition.name}: ${parsedInput.error.message}`);
  const output = await definition.execute(parsedInput.data);
  const parsedOutput = definition.outputSchema.safeParse(output);
  if (!parsedOutput.success) throw new ToolError(`Invalid output from ${definition.name}: ${parsedOutput.error.message}`);
  return parsedOutput.data;
}, { name: definition.name, description: definition.description, schema: definition.inputSchema });
