import type { Memory, MemoryScope } from "../../../../packages/domain/src/index.js";
export interface MemoryRepository { retrieve(input: { companyId: string; scope: MemoryScope; query?: string }): Promise<Memory[]>; write(memory: Memory): Promise<void>; }
export class InMemoryMemoryRepository implements MemoryRepository {
  private readonly records: Memory[] = [];
  async retrieve(input: { companyId: string; scope: MemoryScope; query?: string }): Promise<Memory[]> { return this.records.filter((record) => record.companyId === input.companyId && record.scope === input.scope && (!input.query || record.content.toLowerCase().includes(input.query.toLowerCase()))); }
  async write(memory: Memory): Promise<void> { const index = this.records.findIndex((record) => record.memoryId === memory.memoryId); if (index >= 0) this.records[index] = memory; else this.records.push(memory); }
}
