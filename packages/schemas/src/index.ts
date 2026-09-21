import { z } from "zod";
export const IdSchema = z.string().uuid();
export const FounderRequestSchema = z.object({ taskId: IdSchema.optional(), companyId: IdSchema, founderId: IdSchema, objective: z.string().min(1).max(10_000), threadId: IdSchema.optional() });
export type FounderRequest = z.infer<typeof FounderRequestSchema>;
export const ApprovalDecisionSchema = z.object({ approvalId: IdSchema, decision: z.enum(["APPROVED", "REJECTED"]), decidedBy: IdSchema, note: z.string().max(2_000).optional() });
export const CreateTaskInputSchema = z.object({ title: z.string().min(1).max(500), ownerId: IdSchema, dueAt: z.string().datetime().optional(), idempotencyKey: z.string().min(8).max(200) });
