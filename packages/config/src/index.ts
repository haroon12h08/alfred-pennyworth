import { z } from "zod";

const booleanFromEnvironment = z.enum(["true", "false"]).default("false").transform((value) => value === "true");
export const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  LANGSMITH_API_KEY: z.string().min(1).optional(),
  LANGSMITH_PROJECT: z.string().min(1).default("alfred"),
  LANGSMITH_TRACING: booleanFromEnvironment,
  LLM_PROVIDER_API_KEY: z.string().min(1).optional()
}).superRefine((environment, context) => {
  if (environment.LANGSMITH_TRACING && !environment.LANGSMITH_API_KEY) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["LANGSMITH_API_KEY"], message: "LANGSMITH_API_KEY is required when LANGSMITH_TRACING is true." });
  }
});
export type Environment = z.infer<typeof EnvironmentSchema>;
export const loadEnvironment = (input: NodeJS.ProcessEnv = process.env): Environment => EnvironmentSchema.parse(input);
