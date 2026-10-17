import { describe, expect, it } from "vitest";
import { createSeed } from "../src/lib/seed";
import {
  briefSources,
  isOverdue,
  summary,
  transition,
} from "../src/lib/workflow";
import { today } from "../src/lib/dates";
import { taskSchema } from "../src/lib/model";

describe("fictional caseload", () => {
  it("seeds 53 unique clients and valid, attributable records", () => {
    const s = createSeed();
    expect(s.clients).toHaveLength(53);
    expect(new Set(s.clients.map((c) => c.id)).size).toBe(53);
    for (const obs of s.observations) {
      expect(obs.sourceNoteIds.length).toBeGreaterThan(0);
      for (const id of obs.sourceNoteIds)
        expect(s.notes.find((n) => n.id === id)?.clientId).toBe(obs.clientId);
    }
    for (const task of s.followUps)
      expect(taskSchema.safeParse(task).success).toBe(true);
    expect(summary(s, today())).toMatchObject({
      assigned: 53,
      open: 5,
      review: 2,
      overdue: 1,
    });
  });
  it("grounds Margaret’s observation in both notes and does not invent a change for David", () => {
    const s = createSeed();
    const b = briefSources(s, "client_1");
    expect(b.observations[0].sourceNoteIds).toEqual(["note_1", "note_2"]);
    expect(b.notes.length).toBeGreaterThanOrEqual(2);
    expect(briefSources(s, "client_4").observations).toHaveLength(0);
  });
  it("uses the selected review period and excludes older observations", () => {
    const s = createSeed();
    expect(briefSources(s, "client_1", "2099-01-01").notes).toHaveLength(0);
    expect(briefSources(s, "client_1", "2099-01-01").observations).toHaveLength(
      0,
    );
  });
});
describe("follow-through lifecycle", () => {
  it("requires outcomes, preserves history through resolution and reopening, and updates counts", () => {
    const s = createSeed(),
      task = s.followUps[2],
      now = new Date().toISOString();
    expect(() => transition(task, "RESOLVED", " ", now)).toThrow("outcome");
    expect(() => transition(task, "BLOCKED", "", now)).toThrow("reason");
    const resolved = transition(
      task,
      "RESOLVED",
      "Helen informed of the enquiry outcome.",
      now,
    );
    expect(isOverdue(resolved, today())).toBe(false);
    expect(
      summary(
        {
          ...s,
          followUps: s.followUps.map((t) => (t.id === task.id ? resolved : t)),
        },
        today(),
      ).open,
    ).toBe(4);
    expect(() => transition(resolved, "OPEN", "", now)).toThrow("reason");
    const reopened = transition(
      resolved,
      "OPEN",
      "Helen requested further clarification.",
      now,
    );
    expect(reopened.activities).toHaveLength(task.activities.length + 2);
    expect(reopened.resolutionOutcome).toBe(resolved.resolutionOutcome);
    expect(isOverdue(reopened, today())).toBe(true);
    expect(task.activities).toHaveLength(1);
  });
  it("does not treat today as overdue or change independent tasks on contact documentation", () => {
    const s = createSeed();
    expect(isOverdue({ ...s.followUps[0], dueDate: today() }, today())).toBe(
      false,
    );
    const next = {
      ...s,
      interactions: [
        ...s.interactions,
        {
          ...s.interactions[0],
          id: "new",
          occurredAt: new Date().toISOString(),
        },
      ],
    };
    expect(summary(next, today()).open).toBe(summary(s, today()).open);
  });
});

import { demoStateSchema } from "../src/lib/model";
import { formatDate, sydneyDate } from "../src/lib/dates";
describe("trusted data boundaries and Sydney calendar dates", () => {
  it("validates seed and rejects malformed or cross-client sources", () => {
    const state = createSeed();
    expect(demoStateSchema.safeParse(state).success).toBe(true);
    expect(demoStateSchema.safeParse({ ...state, clients: [{}] }).success).toBe(
      false,
    );
    expect(
      demoStateSchema.safeParse({
        ...state,
        observations: [{ ...state.observations[0], sourceNoteIds: ["note_4"] }],
      }).success,
    ).toBe(false);
  });
  it("does not shift date-only values into the previous day during winter", () => {
    expect(formatDate("2026-07-01")).toContain("1 July 2026");
    expect(sydneyDate(new Date("2026-10-16T14:00:00Z"))).toBe("2026-10-17");
    expect(
      taskSchema.safeParse({
        ...createSeed().followUps[0],
        dueDate: "2026-02-30",
      }).success,
    ).toBe(false);
  });
});
