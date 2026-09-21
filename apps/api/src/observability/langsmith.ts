import { Client } from "langsmith";
import type { Environment } from "../../../../packages/config/src/index.js";
import type { Logger } from "./logger.js";
export const createLangSmithClient = (environment: Environment, logger: Logger): Client | undefined => {
  if (!environment.LANGSMITH_TRACING) { logger.info("observability.langsmith.disabled", { project: environment.LANGSMITH_PROJECT }); return undefined; }
  logger.info("observability.langsmith.enabled", { project: environment.LANGSMITH_PROJECT });
  const apiKey = environment.LANGSMITH_API_KEY;
  if (!apiKey) throw new Error("LANGSMITH_API_KEY is required when tracing is enabled.");
  return new Client({ apiKey });
};
