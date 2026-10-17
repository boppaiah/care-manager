import { z } from "zod";
export const statusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "BLOCKED",
  "RESOLVED",
]);
export type Status = z.infer<typeof statusSchema>;
export type Priority = "high" | "medium" | "low";
export interface Client {
  id: string;
  displayName: string;
  clientRef: string;
  supporterName?: string;
  supporterRole?: string;
  nextContact: string;
}
export interface Note {
  id: string;
  clientId: string;
  recordedAt: string;
  authorName: string;
  authorRole: string;
  body: string;
  sourceRecordId: string;
}
export interface Interaction {
  id: string;
  clientId: string;
  occurredAt: string;
  contactedPerson: string;
  contactMethod: string;
  summary: string;
  recordedBy: string;
  createdAt: string;
}
export interface Observation {
  requiresHumanReview: true;
  confidenceLabel: "needs_verification";
  id: string;
  clientId: string;
  summary: string;
  category: string;
  suggestedPriority: Priority;
  sourceNoteIds: string[];
  reviewStatus: "NEEDS_REVIEW" | "CONFIRMED" | "DISMISSED";
  reviewedAt?: string;
  reviewedBy?: string;
}
export interface Activity {
  id: string;
  action: string;
  note: string;
  actorId: string;
  createdAt: string;
}
export interface FollowUp {
  id: string;
  clientId: string;
  title: string;
  description: string;
  ownerId: string;
  dueDate: string;
  status: Status;
  priority: Priority;
  originType: "manual" | "interaction" | "observation";
  originId?: string;
  resolutionOutcome?: string;
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
}
export interface DemoState {
  version: 1;
  clients: Client[];
  notes: Note[];
  interactions: Interaction[];
  observations: Observation[];
  followUps: FollowUp[];
  discussionPoints: Record<string, string>;
}
export const taskSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(3).max(4000),
  ownerId: z.enum(["Sarah Mitchell", "James Lee", "Emma Davis"]),
  dueDate: z.iso.date("Choose a valid date"),
  priority: z.enum(["high", "medium", "low"]),
  originType: z.enum(["manual", "interaction", "observation"]),
  originId: z.string().optional(),
});
export const interactionSchema = z.object({
  clientId: z.string().min(1),
  occurredAt: z
    .string()
    .min(1)
    .refine(
      (v) => !Number.isNaN(Date.parse(v)),
      "Choose a valid date and time",
    ),
  contactedPerson: z.string().trim().min(2),
  contactMethod: z.string().trim().min(2),
  summary: z.string().trim().min(5).max(4000),
});
export const owners = ["Sarah Mitchell", "James Lee", "Emma Davis"];
export const statusLabel = (s: Status) =>
  ({
    OPEN: "Open",
    IN_PROGRESS: "In progress",
    BLOCKED: "Blocked",
    RESOLVED: "Resolved",
  })[s];

/** Validate browser storage as untrusted input before using it as application state. */
const idSchema = z.string().min(1);
const dateSchema = z.iso.date();
const timestampSchema = z.iso.datetime();
const activitySchema = z.object({
  id: idSchema,
  action: z.string(),
  note: z.string(),
  actorId: idSchema,
  createdAt: timestampSchema,
});
export const demoStateSchema: z.ZodType<DemoState> = z
  .object({
    version: z.literal(1),
    clients: z.array(
      z.object({
        id: idSchema,
        displayName: z.string().min(1),
        clientRef: idSchema,
        supporterName: z.string().optional(),
        supporterRole: z.string().optional(),
        nextContact: dateSchema,
      }),
    ),
    notes: z.array(
      z.object({
        id: idSchema,
        clientId: idSchema,
        recordedAt: timestampSchema,
        authorName: z.string(),
        authorRole: z.string(),
        body: z.string(),
        sourceRecordId: idSchema,
      }),
    ),
    interactions: z.array(
      interactionSchema.extend({
        id: idSchema,
        occurredAt: timestampSchema,
        recordedBy: idSchema,
        createdAt: timestampSchema,
      }),
    ),
    observations: z.array(
      z.object({
        id: idSchema,
        clientId: idSchema,
        summary: z.string(),
        category: z.string(),
        suggestedPriority: z.enum(["high", "medium", "low"]),
        sourceNoteIds: z.array(idSchema).min(1),
        requiresHumanReview: z.literal(true),
        confidenceLabel: z.literal("needs_verification"),
        reviewStatus: z.enum(["NEEDS_REVIEW", "CONFIRMED", "DISMISSED"]),
        reviewedAt: timestampSchema.optional(),
        reviewedBy: z.string().optional(),
      }),
    ),
    followUps: z.array(
      taskSchema.extend({
        id: idSchema,
        status: statusSchema,
        createdAt: timestampSchema,
        updatedAt: timestampSchema,
        resolutionOutcome: z.string().optional(),
        activities: z.array(activitySchema),
      }),
    ),
    discussionPoints: z.record(z.string(), z.string()),
  })
  .superRefine((state, ctx) => {
    const clients = new Set(state.clients.map((c) => c.id));
    const sources = new Map(
      [...state.observations, ...state.interactions].map((item) => [
        item.id,
        item,
      ]),
    );
    if (clients.size !== state.clients.length)
      ctx.addIssue({ code: "custom", message: "Duplicate client IDs" });
    for (const item of [
      ...state.notes,
      ...state.interactions,
      ...state.observations,
      ...state.followUps,
    ]) {
      if (!clients.has(item.clientId))
        ctx.addIssue({
          code: "custom",
          message: "Record references an unknown client",
        });
    }
    for (const obs of state.observations)
      for (const id of obs.sourceNoteIds) {
        if (
          !state.notes.some((n) => n.id === id && n.clientId === obs.clientId)
        )
          ctx.addIssue({
            code: "custom",
            message: "Invalid observation source",
          });
      }
    for (const task of state.followUps) {
      if (
        task.originType !== "manual" &&
        (!task.originId ||
          sources.get(task.originId)?.clientId !== task.clientId)
      )
        ctx.addIssue({ code: "custom", message: "Invalid task source" });
    }
  });
