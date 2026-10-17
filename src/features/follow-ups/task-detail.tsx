"use client";
import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/components/demo-provider";
import { Loading, PageHeader, Badge, Empty } from "@/components/ui";
import { transition, isOverdue } from "@/lib/workflow";
import { today, formatDate } from "@/lib/dates";
import { statusLabel, statusSchema, taskSchema, owners } from "@/lib/model";
export function TaskDetail({ id }: { id: string }) {
  const { state, update } = useDemo();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  if (!state) return <Loading />;
  const task = state.followUps.find((t) => t.id === id);
  if (!task)
    return (
      <Empty>
        Follow-up not found. <Link href="/follow-ups">View all follow-ups</Link>
      </Empty>
    );
  const client = state.clients.find((c) => c.id === task.clientId)!;
  return (
    <>
      <Link className="back" href="/follow-ups">
        ← All follow-ups
      </Link>
      <PageHeader
        eyebrow={client.displayName}
        title={task.title}
        description="A clear next step, with the full story behind it."
        action={
          <Badge tone={isOverdue(task, today()) ? "danger" : "green"}>
            {statusLabel(task.status)}
            {isOverdue(task, today()) ? " · Overdue" : ""}
          </Badge>
        }
      />
      <div className="detail-grid">
        <section className="panel padded">
          <h2>Action details</h2>
          <form
            className="form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.currentTarget));
              const parsed = taskSchema.safeParse({ ...task, ...data });
              if (!parsed.success) {
                setError(parsed.error.issues[0].message);
                return;
              }
              const now = new Date().toISOString();
              update((s) => ({
                ...s,
                followUps: s.followUps.map((t) =>
                  t.id === id
                    ? {
                        ...t,
                        ...parsed.data,
                        updatedAt: now,
                        activities: [
                          ...t.activities,
                          {
                            id: crypto.randomUUID(),
                            action: "Details updated",
                            note: `Owner: ${parsed.data.ownerId}. Due: ${parsed.data.dueDate}. Next step: ${parsed.data.description}`,
                            actorId: "Sarah Mitchell",
                            createdAt: now,
                          },
                        ],
                      }
                    : t,
                ),
              }));
              setError("");
              setMessage("Action details saved.");
            }}
          >
            <label className="full">
              Title
              <input
                name="title"
                defaultValue={task.title}
                required
                minLength={3}
                maxLength={180}
              />
            </label>
            <label className="full">
              Next step
              <textarea
                name="description"
                defaultValue={task.description}
                required
                minLength={3}
              />
            </label>
            <label>
              Owner
              <select name="ownerId" defaultValue={task.ownerId}>
                {owners.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label>
              Due date
              <input
                name="dueDate"
                type="date"
                defaultValue={task.dueDate}
                required
              />
            </label>
            <label>
              Priority cue
              <select name="priority" defaultValue={task.priority}>
                {["low", "medium", "high"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <div className="full">
              <button type="submit">Save details</button>
            </div>
          </form>
          <hr />
          <h2>Update progress</h2>
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              const status = statusSchema.parse(data.get("status"));
              try {
                const updated = transition(
                  task,
                  status,
                  String(data.get("note") || ""),
                  new Date().toISOString(),
                );
                update((s) => ({
                  ...s,
                  followUps: s.followUps.map((t) =>
                    t.id === id ? updated : t,
                  ),
                }));
                setError("");
                setMessage("Status updated.");
                form.reset();
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Unable to update status.",
                );
              }
            }}
          >
            <label>
              New status
              <select name="status" defaultValue={task.status}>
                {["OPEN", "IN_PROGRESS", "BLOCKED", "RESOLVED"].map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(statusSchema.parse(s))}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Outcome / blocked or reopening reason
              <textarea
                name="note"
                placeholder="A factual outcome is required to resolve; explain why when blocking or reopening."
              />
            </label>
            <button className="primary">Update status</button>
          </form>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="success">
              {message}
            </p>
          )}
          <hr />
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const note = String(new FormData(form).get("note") || "").trim();
              if (!note) return;
              const now = new Date().toISOString();
              update((s) => ({
                ...s,
                followUps: s.followUps.map((t) =>
                  t.id === id
                    ? {
                        ...t,
                        updatedAt: now,
                        activities: [
                          ...t.activities,
                          {
                            id: crypto.randomUUID(),
                            action: "Progress recorded",
                            note,
                            actorId: "Sarah Mitchell",
                            createdAt: now,
                          },
                        ],
                      }
                    : t,
                ),
              }));
              setMessage("Progress added. Task status is unchanged.");
              form.reset();
            }}
          >
            <label>
              Add a progress note
              <textarea name="note" required maxLength={4000} />
            </label>
            <button>Add progress</button>
          </form>
        </section>
        <aside>
          <section className="panel padded">
            <h2>Connected records</h2>
            <Link href={`/clients/${client.id}/prep`}>
              {client.displayName} → Conversation Prep
            </Link>
            <p>
              Origin:{" "}
              {task.originType === "manual" ? (
                "Manual entry"
              ) : (
                <Link href={`/clients/${client.id}/prep#${task.originId}`}>
                  {task.originType} · {task.originId}
                </Link>
              )}
            </p>
            {task.resolutionOutcome && (
              <p>
                <strong>Previous / latest resolution</strong>
                <br />
                {task.resolutionOutcome}
              </p>
            )}
          </section>
          <section className="panel padded">
            <h2>Activity history</h2>
            <p className="muted">Appended events · Local demo history</p>
            <ol className="timeline">
              {[...task.activities].reverse().map((a) => (
                <li key={a.id}>
                  <strong>{a.action}</strong>
                  <p>{a.note}</p>
                  <small>
                    {a.actorId} · {formatDate(a.createdAt)} ·{" "}
                    {new Date(a.createdAt).toLocaleTimeString("en-AU", {
                      timeZone: "Australia/Sydney",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}
