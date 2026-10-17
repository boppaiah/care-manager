"use client";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, FileText, ArrowRight } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { Badge, Empty, Loading, PageHeader } from "@/components/ui";
import { briefSources } from "@/lib/workflow";
import { formatDate, shiftDate, sydneyDate } from "@/lib/dates";
import { interactionSchema, statusLabel } from "@/lib/model";
import { TaskForm } from "@/features/follow-ups/task-form";
export function Prep({ clientId }: { clientId: string }) {
  const { state, update } = useDemo();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState<{
    type: "interaction" | "observation" | "manual";
    id?: string;
  } | null>(null);
  const [range, setRange] = useState("");
  const [generated, setGenerated] = useState("");
  if (!state) return <Loading />;
  const client = state.clients.find((c) => c.id === clientId);
  if (!client)
    return (
      <Empty>
        Client not found. <Link href="/caseload">Return to caseload</Link>
      </Empty>
    );
  const { start, notes, interactions, observations } = briefSources(
    state,
    clientId,
    range ? range + "T00:00:00Z" : undefined,
  );
  const allInteractions = state.interactions
    .filter((i) => i.clientId === clientId)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const tasks = state.followUps.filter(
    (t) => t.clientId === clientId && t.status !== "RESOLVED",
  );
  const points =
    state.discussionPoints[clientId] ??
    (observations.length
      ? "How have things been since our last conversation?\nWhat would you like us to follow up from these notes?\nAre there any changes to your support preferences?"
      : "How is your current support working for you?\nIs there anything you would like us to follow up?");
  return (
    <>
      <Link className="back" href="/caseload">
        ← My Caseload
      </Link>
      <PageHeader
        eyebrow={`CONVERSATION PREP · ${client.clientRef}`}
        title={client.displayName}
        description="The context you need for a more meaningful conversation."
        action={
          <Link className="button" href="/follow-ups">
            View follow-through <ArrowRight size={15} />
          </Link>
        }
      />
      <div className="client-context">
        <div>
          <span className="avatar large">
            {client.displayName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
          <div>
            <strong>{client.displayName}</strong>
            <small>Assigned to Sarah Mitchell</small>
          </div>
        </div>
        <div>
          <small>Last documented contact</small>
          <strong>
            {allInteractions[0]
              ? formatDate(allInteractions[0].occurredAt)
              : "Not available in provided records"}
          </strong>
          {allInteractions[0] && (
            <small>
              {allInteractions[0].contactMethod} ·{" "}
              {allInteractions[0].contactedPerson}
            </small>
          )}
        </div>
        <div>
          <small>Next entered contact date</small>
          <strong>{formatDate(client.nextContact)}</strong>
        </div>
        <div>
          <small>Registered supporter</small>
          <strong>
            {client.supporterName || "Not available in provided records"}
          </strong>
          <small>{client.supporterRole}</small>
        </div>
      </div>
      <div className="detail-grid prep-grid">
        <div>
          <section className="panel padded">
            <div className="section-heading">
              <div>
                <p className="eyebrow purple-text">
                  <Sparkles size={14} /> YOUR CONVERSATION BRIEF
                </p>
                <h2>What changed?</h2>
              </div>
              <Badge tone="purple">Sample AI output</Badge>
            </div>
            <div className="filters">
              <label>
                Review from
                <input
                  aria-label="Review period start"
                  type="date"
                  value={range || start.slice(0, 10)}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setRange(e.target.value)}
                />
              </label>
              <button onClick={() => setGenerated(new Date().toISOString())}>
                Refresh sample brief
              </button>
            </div>
            <p className="coverage">
              Prepared from {notes.length} notes and {interactions.length}{" "}
              previous interactions · {formatDate(start)} –{" "}
              {formatDate(new Date().toISOString())}
              {generated && (
                <>
                  {" "}
                  · Refreshed {new Date(generated).toLocaleTimeString("en-AU")}
                </>
              )}
            </p>
            {observations.length ? (
              observations.map((o) => (
                <article className="observation" key={o.id} id={o.id}>
                  <div className="section-heading">
                    <Badge
                      tone={
                        o.reviewStatus === "NEEDS_REVIEW" ? "purple" : "green"
                      }
                    >
                      {o.reviewStatus === "NEEDS_REVIEW"
                        ? "AI suggestion · Needs human review"
                        : "Human confirmed"}
                    </Badge>
                    <span className={`priority ${o.suggestedPriority}`}>
                      {o.suggestedPriority} · triage cue
                    </span>
                  </div>
                  <p>{o.summary}</p>
                  <small>
                    Needs verification · Reported observation, not a clinical
                    assessment.
                  </small>
                  <div className="source-links">
                    {o.sourceNoteIds.map((id) => (
                      <a key={id} href={`#${id}`}>
                        <FileText size={12} />
                        {id}
                      </a>
                    ))}
                  </div>
                  <div className="inline-actions">
                    {["CONFIRMED", "DISMISSED"].map((reviewStatus) => (
                      <button
                        key={reviewStatus}
                        onClick={() =>
                          update((s) => ({
                            ...s,
                            observations: s.observations.map((item) =>
                              item.id === o.id
                                ? {
                                    ...item,
                                    reviewStatus: reviewStatus as
                                      "CONFIRMED" | "DISMISSED",
                                    reviewedAt: new Date().toISOString(),
                                    reviewedBy: "Sarah Mitchell",
                                  }
                                : item,
                            ),
                          }))
                        }
                      >
                        {reviewStatus === "CONFIRMED"
                          ? "Confirm observation"
                          : "Dismiss"}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setFollowUp({ type: "observation", id: o.id })
                      }
                    >
                      Create follow-up
                    </button>
                    <label className="compact">
                      Override priority
                      <select
                        aria-label={`Priority for ${o.id}`}
                        value={o.suggestedPriority}
                        onChange={(e) =>
                          update((s) => ({
                            ...s,
                            observations: s.observations.map((item) =>
                              item.id === o.id
                                ? {
                                    ...item,
                                    suggestedPriority: e.target.value as
                                      "high" | "medium" | "low",
                                    reviewedBy: "Sarah Mitchell",
                                    reviewedAt: new Date().toISOString(),
                                  }
                                : item,
                            ),
                          }))
                        }
                      >
                        {["low", "medium", "high"].map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))
            ) : (
              <Empty>
                {notes.length
                  ? "No new notable change detected in the reviewed data. This is a sample briefing, not a clinical assessment."
                  : "No notes available in this review period. A change summary is not available in provided records."}
              </Empty>
            )}
            <p className="notice">
              For possible serious deterioration, seek prompt human review
              through your provider’s existing escalation pathway. This demo
              does not determine clinical urgency.
            </p>
          </section>
          <section className="panel padded">
            <h2>Recent care notes</h2>
            <p className="muted">
              Original seeded records · Simulated incumbent system
            </p>
            {notes.length ? (
              notes.map((n) => (
                <details className="note" key={n.id} id={n.id}>
                  <summary>
                    <FileText size={16} />
                    <span>
                      {formatDate(n.recordedAt)} · {n.authorName}
                      <small>
                        {n.authorRole} · {n.sourceRecordId} · {n.id}
                      </small>
                    </span>
                    <span>Read note +</span>
                  </summary>
                  <p>{n.body}</p>
                </details>
              ))
            ) : (
              <Empty>No source notes in this period.</Empty>
            )}
            {state.notes
              .filter(
                (n) =>
                  n.clientId === clientId && !notes.some((v) => v.id === n.id),
              )
              .map((n) => (
                <details key={n.id} id={n.id} className="note">
                  <summary>
                    {formatDate(n.recordedAt)} · Earlier source note · {n.id}
                  </summary>
                  <p>{n.body}</p>
                  <small>
                    {n.authorName} · {n.authorRole} · {n.sourceRecordId} ·
                    Outside current brief period
                  </small>
                </details>
              ))}
          </section>
          <section className="panel padded">
            <h2>Document a conversation</h2>
            <p className="muted">
              Record an interaction after making contact outside this demo.
            </p>
            <form
              className="form-grid"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                const person = String(data.get("person"));
                const method = String(data.get("method"));
                const result = interactionSchema.safeParse({
                  clientId,
                  occurredAt: data.get("occurredAt"),
                  contactedPerson:
                    person === "Other" ? data.get("otherPerson") : person,
                  contactMethod:
                    method === "Other" ? data.get("otherMethod") : method,
                  summary: data.get("summary"),
                });
                if (!result.success) {
                  setError(result.error.issues[0].message);
                  return;
                }
                if (new Date(result.data.occurredAt) > new Date()) {
                  setError("A completed conversation cannot be in the future.");
                  return;
                }
                const now = new Date().toISOString(),
                  id = crypto.randomUUID();
                const interaction = {
                  ...result.data,
                  occurredAt: new Date(result.data.occurredAt).toISOString(),
                  id,
                  createdAt: now,
                  recordedBy: "Sarah Mitchell",
                };
                update((s) => {
                  const latest = [
                    ...s.interactions.filter((i) => i.clientId === clientId),
                    interaction,
                  ].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
                  return {
                    ...s,
                    interactions: [interaction, ...s.interactions],
                    clients: s.clients.map((c) =>
                      c.id === clientId
                        ? {
                            ...c,
                            nextContact: shiftDate(
                              sydneyDate(new Date(latest.occurredAt)),
                              30,
                            ),
                          }
                        : c,
                    ),
                  };
                });
                setError("");
                setMessage(
                  "Contact documented. Independent follow-ups remain open. Next contact is suggested 30 days after the latest recorded contact; provider rules may differ.",
                );
                if (data.get("followUp"))
                  setFollowUp({ type: "interaction", id });
                form.reset();
              }}
            >
              <label>
                Contact date / time (your local timezone)
                <input name="occurredAt" type="datetime-local" required />
              </label>
              <label>
                Person contacted
                <select name="person">
                  <option>Client</option>
                  <option>Registered supporter</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Other person (if selected)
                <input name="otherPerson" placeholder="Name / role" />
              </label>
              <label>
                Method
                <select name="method">
                  <option>Phone</option>
                  <option>In person</option>
                  <option>Video</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Other method (if selected)
                <input name="otherMethod" />
              </label>
              <label className="full">
                Factual summary / outcome
                <textarea
                  name="summary"
                  required
                  minLength={5}
                  maxLength={4000}
                />
              </label>
              <label className="checkbox full">
                <input type="checkbox" name="followUp" /> Create a follow-up
                after saving
              </label>
              {error && (
                <p className="error full" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="success full" role="status">
                  {message}
                </p>
              )}
              <div className="full">
                <button className="primary">Save contact documentation</button>
              </div>
            </form>
          </section>
          {followUp && (
            <section className="panel padded" id="create-task">
              <h2>Create follow-up</h2>
              <TaskForm
                clientId={clientId}
                originType={followUp.type}
                originId={followUp.id}
              />
              <button className="text-button" onClick={() => setFollowUp(null)}>
                Cancel
              </button>
            </section>
          )}
          <section className="panel padded">
            <h2>Contact timeline</h2>
            {allInteractions.length ? (
              <ol className="timeline">
                {allInteractions.map((i) => (
                  <li key={i.id} id={i.id}>
                    <strong>
                      {formatDate(i.occurredAt)} · Contact documented
                    </strong>
                    <p>{i.summary}</p>
                    <small>
                      {i.contactMethod} · {i.contactedPerson} · {i.recordedBy} ·
                      Entered {formatDate(i.createdAt)}
                    </small>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty>No interactions documented yet.</Empty>
            )}
          </section>
        </div>
        <aside>
          <section className="panel padded">
            <p className="eyebrow">KEEP THE CONVERSATION HUMAN</p>
            <h2>Suggested discussion points</h2>
            <Badge tone="purple">Editable sample suggestions</Badge>
            <label className="stack">
              Talking points
              <textarea
                rows={9}
                value={points}
                onChange={(e) =>
                  update((s) => ({
                    ...s,
                    discussionPoints: {
                      ...s.discussionPoints,
                      [clientId]: e.target.value,
                    },
                  }))
                }
              />
            </label>
            <small>
              Saved locally as you edit. Suggestions never commit actions on
              your behalf.
            </small>
          </section>
          <section className="panel padded">
            <div className="section-heading">
              <h2>Open requests & actions</h2>
              <Badge>{tasks.length}</Badge>
            </div>
            {tasks.length ? (
              tasks.map((t) => (
                <Link
                  className="action-card"
                  href={`/follow-ups/${t.id}`}
                  key={t.id}
                >
                  <strong>{t.title}</strong>
                  <p>{t.description}</p>
                  <Badge tone={t.status === "BLOCKED" ? "amber" : "green"}>
                    {statusLabel(t.status)}
                  </Badge>
                  <small>
                    {t.ownerId} · Due {formatDate(t.dueDate)}
                  </small>
                  <small>
                    Origin:{" "}
                    {t.originType === "manual"
                      ? "Manual entry"
                      : `${t.originType} ${t.originId}`}
                  </small>
                </Link>
              ))
            ) : (
              <Empty>
                No open requests or actions in the provided records.
              </Empty>
            )}
            <button onClick={() => setFollowUp({ type: "manual" })}>
              + Add manual follow-up
            </button>
          </section>
          <section className="panel padded">
            <h2>Source coverage</h2>
            <p>
              {notes.length} notes · {interactions.length} interactions
            </p>
            <p className="muted">
              Review period begins at the latest recorded conversation, or 30
              days ago when no conversation is available. Adjust the date to
              review earlier records.
            </p>
            <p className="muted">
              Clinical plans, diagnoses and provider availability: not available
              in provided records.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
