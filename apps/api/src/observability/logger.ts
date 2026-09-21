export interface Logger { info(event: string, attributes: Record<string, unknown>): void; error(event: string, attributes: Record<string, unknown>): void; }
const sanitize = (attributes: Record<string, unknown>): Record<string, unknown> => Object.fromEntries(Object.entries(attributes).filter(([key]) => !/(key|secret|password|token)/i.test(key)));
export class JsonLogger implements Logger {
  info(event: string, attributes: Record<string, unknown>): void { console.info(JSON.stringify({ level: "info", event, ...sanitize(attributes), timestamp: new Date().toISOString() })); }
  error(event: string, attributes: Record<string, unknown>): void { console.error(JSON.stringify({ level: "error", event, ...sanitize(attributes), timestamp: new Date().toISOString() })); }
}
