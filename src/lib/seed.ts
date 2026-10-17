import type { DemoState, FollowUp } from "./model";
import { shiftDate, today } from "./dates";
export function createSeed(): DemoState {
  const date = today();
  const names = [
    "Margaret Wilson",
    "Robert Chen",
    "Helen Parker",
    "David Thompson",
    "Linda Harris",
  ];
  const first = [
    "Arthur",
    "Dorothy",
    "George",
    "Patricia",
    "William",
    "Joan",
    "Edward",
    "Elizabeth",
    "Frank",
    "Susan",
    "Peter",
    "Rose",
  ];
  const last = ["Bennett", "Clarke", "Evans", "Foster"];
  for (const surname of last)
    for (const name of first) names.push(`${name} ${surname}`);
  const clients = names.map((displayName, i) => ({
    id: `client_${i + 1}`,
    displayName,
    clientRef: `CM-${String(i + 1).padStart(4, "0")}`,
    nextContact: shiftDate(date, i < 2 ? 16 : (i % 30) - 2),
    ...(i === 0
      ? {
          supporterName: "Anna Wilson",
          supporterRole: "Daughter, registered supporter",
        }
      : {}),
  }));
  const contents = [
    "Worker reports Margaret was unsteady when walking to the kitchen. Margaret accepted assistance.",
    "Worker reports Margaret ate less lunch than usual and said she felt tired.",
    "Anna Wilson asked about physiotherapy availability. No provider availability has been confirmed.",
    "Robert’s family asked whether the morning visit could move to a later time. Scheduling confirmation is pending.",
    "Helen asked for an update on a missed-service enquiry. Outcome is not yet recorded.",
    "David participated in his usual routine and reported no new concerns during this visit.",
    "David enjoyed lunch and a walk in the garden. No change was reported by the worker.",
    "Linda’s family requested another discussion after the earlier transport enquiry was resolved.",
    "Margaret received her scheduled domestic assistance. No additional concern was recorded.",
    "Robert was comfortable during the visit and confirmed receipt of the proposed visit-time discussion.",
    "Helen received her scheduled visit and asked who would respond to the enquiry.",
    "Linda requested a call to discuss the family’s updated transport preferences.",
  ];
  const ids = [1, 1, 1, 2, 3, 4, 4, 5, 1, 2, 3, 5];
  const notes = contents.map((body, i) => ({
    id: `note_${i + 1}`,
    clientId: `client_${ids[i]}`,
    recordedAt: shiftDate(date, -(12 - i)) + "T03:00:00Z",
    authorName: i % 2 ? "Alex Morgan" : "Taylor Reed",
    authorRole: "Care worker",
    body,
    sourceRecordId: `SIM-${1001 + i}`,
  }));
  const timestamp = shiftDate(date, -5) + "T01:00:00Z";
  const tasks: [number, string, string, FollowUp["status"], number][] = [
    [
      1,
      "Check physiotherapy availability",
      "Check options and respond to Anna Wilson.",
      "OPEN",
      2,
    ],
    [
      2,
      "Confirm requested visit time",
      "Await scheduling team confirmation before responding to family.",
      "BLOCKED",
      1,
    ],
    [
      3,
      "Respond to missed-service enquiry",
      "Investigate the missed service and respond to Helen using the provider’s formal process where appropriate.",
      "OPEN",
      -3,
    ],
    [
      5,
      "Review updated transport request",
      "Call Linda to discuss the family’s subsequent response.",
      "IN_PROGRESS",
      3,
    ],
    [
      6,
      "Arrange routine review conversation",
      "Agree a suitable time with the client.",
      "OPEN",
      5,
    ],
  ];
  const followUps: FollowUp[] = tasks.map(
    ([n, title, description, status, offset], i) => ({
      id: `task_${i + 1}`,
      clientId: `client_${n}`,
      title,
      description,
      ownerId: i % 2 ? "James Lee" : "Sarah Mitchell",
      dueDate: shiftDate(date, offset),
      status,
      priority: i === 2 ? "high" : "medium",
      originType: i === 0 ? "observation" : "manual",
      ...(i === 0 ? { originId: "obs_1" } : {}),
      createdAt: timestamp,
      updatedAt: timestamp,
      activities: [
        {
          id: `activity_${i}`,
          action: "Created",
          note: description,
          actorId: "Sarah Mitchell",
          createdAt: timestamp,
        },
        ...(i === 1
          ? [
              {
                id: "blocked_seed",
                action: "Blocked",
                note: "Waiting on scheduling team confirmation.",
                actorId: "James Lee",
                createdAt: timestamp,
              },
            ]
          : []),
        ...(i === 3
          ? [
              {
                id: "resolved_seed",
                action: "Resolved",
                note: "Initial transport options discussed with Linda.",
                actorId: "Sarah Mitchell",
                createdAt: timestamp,
              },
              {
                id: "reopened_seed",
                action: "Reopened",
                note: "Family supplied updated transport preferences; a new discussion is needed.",
                actorId: "Sarah Mitchell",
                createdAt: timestamp,
              },
            ]
          : []),
      ],
    }),
  );
  return {
    version: 1,
    clients,
    notes,
    followUps,
    discussionPoints: {},
    interactions: [1, 2].map((n) => ({
      id: `interaction_${n}`,
      clientId: `client_${n}`,
      occurredAt: shiftDate(date, -14) + "T02:00:00Z",
      contactedPerson: "Client",
      contactMethod: "Phone",
      summary:
        "Routine care-management conversation documented. Preferences and current support discussed.",
      recordedBy: "Sarah Mitchell",
      createdAt: timestamp,
    })),
    observations: [
      {
        id: "obs_1",
        clientId: "client_1",
        summary:
          "Workers report unsteadiness, reduced appetite and fatigue. Review the source notes and discuss with Margaret; no diagnosis is inferred.",
        category: "change_in_wellbeing",
        suggestedPriority: "medium",
        sourceNoteIds: ["note_1", "note_2"],
        requiresHumanReview: true,
        confidenceLabel: "needs_verification",
        reviewStatus: "NEEDS_REVIEW",
      },
      {
        id: "obs_2",
        clientId: "client_3",
        summary:
          "Helen has asked for an update on an unresolved missed-service enquiry.",
        category: "request",
        suggestedPriority: "medium",
        sourceNoteIds: ["note_5"],
        requiresHumanReview: true,
        confidenceLabel: "needs_verification",
        reviewStatus: "NEEDS_REVIEW",
      },
      {
        id: "obs_3",
        clientId: "client_2",
        summary:
          "Family requested a later visit time; scheduling is still pending.",
        category: "request",
        suggestedPriority: "low",
        sourceNoteIds: ["note_4"],
        requiresHumanReview: true,
        confidenceLabel: "needs_verification",
        reviewStatus: "CONFIRMED",
      },
      {
        id: "obs_4",
        clientId: "client_4",
        summary:
          "Routine visit recorded; no new concern reported in this note.",
        category: "routine",
        suggestedPriority: "low",
        sourceNoteIds: ["note_6"],
        requiresHumanReview: true,
        confidenceLabel: "needs_verification",
        reviewStatus: "DISMISSED",
      },
    ],
  };
}
