import type { DemoState, FollowUp, Status } from "./model";
import { shiftDate, today } from "./dates";
export function isOverdue(task: FollowUp, date: string) {
  return task.status !== "RESOLVED" && task.dueDate < date;
}
export function summary(state: DemoState, date: string) {
  return {
    assigned: state.clients.length,
    contacts: state.clients.filter((c) => c.nextContact <= shiftDate(date, 7))
      .length,
    open: state.followUps.filter((t) => t.status !== "RESOLVED").length,
    review: state.observations.filter((o) => o.reviewStatus === "NEEDS_REVIEW")
      .length,
    overdue: state.followUps.filter((t) => isOverdue(t, date)).length,
  };
}
export function transition(
  task: FollowUp,
  status: Status,
  note: string,
  now: string,
): FollowUp {
  if (status === task.status) throw new Error("Choose a different status.");
  if (
    (status === "RESOLVED" ||
      status === "BLOCKED" ||
      task.status === "RESOLVED") &&
    !note.trim()
  )
    throw new Error(
      status === "RESOLVED"
        ? "A factual resolution outcome is required."
        : status === "BLOCKED"
          ? "A blocked reason is required."
          : "A reopening reason is required.",
    );
  return {
    ...task,
    status,
    updatedAt: now,
    ...(status === "RESOLVED" ? { resolutionOutcome: note.trim() } : {}),
    activities: [
      ...task.activities,
      {
        id: crypto.randomUUID(),
        action:
          task.status === "RESOLVED"
            ? "Reopened"
            : status === "RESOLVED"
              ? "Resolved"
              : status === "BLOCKED"
                ? "Blocked"
                : "Status changed",
        note: note.trim() || `Status changed to ${status}`,
        actorId: "Sarah Mitchell",
        createdAt: now,
      },
    ],
  };
}
export function briefSources(
  state: DemoState,
  clientId: string,
  rangeStart?: string,
) {
  const interactions = state.interactions
    .filter((i) => i.clientId === clientId)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const start =
    rangeStart ||
    interactions[0]?.occurredAt ||
    shiftDate(today(), -30) + "T00:00:00Z";
  const notes = state.notes.filter(
    (n) => n.clientId === clientId && n.recordedAt >= start,
  );
  return {
    start,
    notes,
    interactions: interactions.filter((i) => i.occurredAt >= start),
    observations: state.observations.filter(
      (o) =>
        o.clientId === clientId &&
        o.reviewStatus !== "DISMISSED" &&
        o.sourceNoteIds.some((id) => notes.some((n) => n.id === id)),
    ),
  };
}
