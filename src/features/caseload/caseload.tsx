"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Search,
  Users,
  CalendarDays,
  ListChecks,
  Sparkles,
  Clock3,
} from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { Badge, Empty, Loading, PageHeader } from "@/components/ui";
import { summary, isOverdue } from "@/lib/workflow";
import { today, formatDate, shiftDate } from "@/lib/dates";
import { statusLabel } from "@/lib/model";
export function Caseload() {
  const { state } = useDemo();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Open");
  const [type, setType] = useState("All");
  const [priority, setPriority] = useState("All");
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState("work");
  const [limit, setLimit] = useState(15);
  if (!state) return <Loading />;
  const date = today(),
    counts = summary(state, date);
  const rows = [
    ...state.followUps.map((t) => ({
      id: t.id,
      clientId: t.clientId,
      title: t.title,
      type: "Follow-up",
      status: t.status === "RESOLVED" ? "Completed" : "Open",
      label: statusLabel(t.status),
      priority: t.priority,
      due: t.dueDate,
      evidence: t.originType === "manual" ? "Manual entry" : "Source linked",
      href: `/follow-ups/${t.id}`,
      rank: isOverdue(t, date) ? 0 : 3,
      overdue: isOverdue(t, date),
    })),
    ...state.clients.map((c) => ({
      id: `contact_${c.id}`,
      clientId: c.id,
      title: "Care-management conversation",
      type: "Contact",
      status: "Open",
      label: "Contact due",
      priority: "low",
      due: c.nextContact,
      evidence: "Entered contact records",
      href: `/clients/${c.id}/prep`,
      rank: c.nextContact <= shiftDate(date, 7) ? 1 : 4,
      overdue: false,
    })),
    ...state.observations
      .filter((o) => o.reviewStatus !== "DISMISSED")
      .map((o) => ({
        id: o.id,
        clientId: o.clientId,
        title: o.summary,
        type: "Observation",
        status: o.reviewStatus === "NEEDS_REVIEW" ? "Needs review" : "Open",
        label: o.reviewStatus === "NEEDS_REVIEW" ? "Needs review" : "Confirmed",
        priority: o.suggestedPriority,
        due: date,
        evidence: `${o.sourceNoteIds.length} notes linked`,
        href: `/clients/${o.clientId}/prep#${o.id}`,
        rank: 2,
        overdue: false,
      })),
  ];
  const filtered = rows
    .filter((r) => {
      const c = state.clients.find((c) => c.id === r.clientId)!;
      return (
        `${c.displayName} ${c.clientRef}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === "All" ||
          (status === "Contact due soon" &&
            r.type === "Contact" &&
            r.due <= shiftDate(date, 7)) ||
          (status === "Overdue"
            ? r.overdue
            : status === "Open"
              ? r.status !== "Completed"
              : r.status === status)) &&
        (type === "All" || type === r.type) &&
        (priority === "All" || priority.toLowerCase() === r.priority)
      );
    })
    .sort((a, b) =>
      sort === "name"
        ? state.clients
            .find((c) => c.id === a.clientId)!
            .displayName.localeCompare(
              state.clients.find((c) => c.id === b.clientId)!.displayName,
            )
        : sort === "date"
          ? a.due.localeCompare(b.due)
          : sort === "priority"
            ? ["high", "medium", "low"].indexOf(a.priority) -
              ["high", "medium", "low"].indexOf(b.priority)
            : a.rank - b.rank || a.due.localeCompare(b.due),
    );
  return (
    <>
      <PageHeader
        eyebrow={formatDate(date).toUpperCase()}
        title="My Caseload"
        description="A clear view of what needs your attention. More space for the people behind it."
        action={
          <Link className="button primary" href="/follow-ups?new=1">
            + Create follow-up
          </Link>
        }
      />
      <div className="greeting">
        <div>
          <span className="eyebrow">YOUR DAY, AT A GLANCE</span>
          <h2>Good care starts with a clear next step.</h2>
          <p>
            You have {counts.overdue} overdue follow-up
            {counts.overdue === 1 ? "" : "s"} and {counts.review} observations
            to review.
          </p>
        </div>
        <span className="greeting-art">
          <HeartIllustration />
        </span>
      </div>
      <div className="stats">
        {[
          ["Assigned clients", counts.assigned, Users, "All"],
          ["Contact due soon", counts.contacts, CalendarDays, "Contact"],
          ["Open follow-ups", counts.open, ListChecks, "Follow-up"],
          ["Needs review", counts.review, Sparkles, "Needs review"],
          ["Overdue", counts.overdue, Clock3, "Overdue"],
        ].map(([label, count, Icon, filter]) => {
          const I = Icon as typeof Users;
          return (
            <button
              key={String(label)}
              className="stat"
              onClick={() => {
                setQuery("");
                setPriority("All");
                setView(filter === "All" ? "clients" : "work");
                setType(
                  filter === "Contact" || filter === "Follow-up"
                    ? String(filter)
                    : "All",
                );
                setStatus(
                  filter === "Contact" ||
                    filter === "Needs review" ||
                    filter === "Overdue"
                    ? filter === "Contact"
                      ? "Contact due soon"
                      : String(filter)
                    : "Open",
                );
              }}
            >
              <I size={19} />
              <strong>{String(count)}</strong>
              <span>{String(label)}</span>
            </button>
          );
        })}
      </div>
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>
              Your worklist{" "}
              <span className="count">
                {view === "work" ? filtered.length : state.clients.length}
              </span>
            </h2>
            <p className="muted">
              Human-confirmed work and source-linked suggestions, together.
            </p>
          </div>
          <div className="tabs">
            <button
              className={view === "work" ? "selected" : ""}
              onClick={() => setView("work")}
            >
              Work items
            </button>
            <button
              className={view === "clients" ? "selected" : ""}
              onClick={() => setView("clients")}
            >
              All clients
            </button>
          </div>
        </div>
        <div className="filters">
          <label className="search">
            <Search size={17} />
            <input
              aria-label="Search clients"
              placeholder="Search name or client ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {view === "work" && (
            <>
              <label>
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {[
                    "Open",
                    "Overdue",
                    "Needs review",
                    "Contact due soon",
                    "Completed",
                    "All",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Type
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  {["All", "Contact", "Observation", "Follow-up"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Priority
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {["All", "High", "Medium", "Low"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Sort
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="recommended">Recommended</option>
                  <option value="date">Due date</option>
                  <option value="name">Client name</option>
                  <option value="priority">Priority</option>
                </select>
              </label>
            </>
          )}
        </div>
        {view === "clients" ? (
          <div className="client-grid">
            {state.clients
              .filter((c) =>
                `${c.displayName} ${c.clientRef}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((c) => (
                <Link
                  className="client-card"
                  key={c.id}
                  href={`/clients/${c.id}/prep`}
                >
                  <span className="avatar">
                    {c.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <div>
                    <strong>{c.displayName}</strong>
                    <small>
                      {c.clientRef} · Contact {formatDate(c.nextContact)}
                    </small>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
          </div>
        ) : filtered.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Client / work item</th>
                  <th>Type & evidence</th>
                  <th>Status</th>
                  <th>Priority cue</th>
                  <th>Due date</th>
                  <th>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, limit).map((r) => {
                  const c = state.clients.find((c) => c.id === r.clientId)!;
                  return (
                    <tr key={r.id}>
                      <td>
                        <Link
                          className="client-name"
                          href={`/clients/${c.id}/prep`}
                        >
                          {c.displayName}
                        </Link>
                        <span className="row-description">{r.title}</span>
                      </td>
                      <td>
                        <span className="type-label">
                          {r.type === "Observation" && <Sparkles size={12} />}{" "}
                          {r.type}
                        </span>
                        <small>{r.evidence}</small>
                      </td>
                      <td>
                        <Badge
                          tone={
                            r.overdue
                              ? "danger"
                              : r.status === "Needs review"
                                ? "purple"
                                : r.label === "Blocked"
                                  ? "amber"
                                  : "green"
                          }
                        >
                          {r.overdue ? "Overdue · " : ""}
                          {r.label}
                        </Badge>
                      </td>
                      <td>
                        <span className={`priority ${r.priority}`}>
                          ● {r.priority}
                        </span>
                      </td>
                      <td className={r.overdue ? "overdue" : ""}>
                        {formatDate(r.due)}
                        {r.type === "Contact" && r.due > shiftDate(date, 7) && (
                          <small>Later this month</small>
                        )}
                      </td>
                      <td>
                        <Link className="row-action" href={r.href}>
                          {r.type === "Follow-up"
                            ? "View follow-up"
                            : "Prepare conversation"}
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>
            {status === "Overdue"
              ? "No overdue follow-ups"
              : "No work items match these filters."}
          </Empty>
        )}
      </section>
      {view === "work" && filtered.length > limit && (
        <div className="load-more">
          <button onClick={() => setLimit((n) => n + 15)}>
            Show more work items ({filtered.length - limit} remaining)
          </button>
        </div>
      )}
      <p className="footnote">
        Priority cues help organise work; they are not clinical acuity scores.
        Contact due soon means within 7 days, including past-due contacts.
      </p>
    </>
  );
}
function HeartIllustration() {
  return (
    <svg
      width="110"
      height="100"
      viewBox="0 0 110 100"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="55" cy="50" r="43" stroke="#b7d5c5" strokeDasharray="4 5" />
      <path
        d="M55 73L31 49C15 30 40 15 55 34C70 15 95 30 79 49Z"
        fill="#c5e2d1"
        stroke="#527c63"
        strokeWidth="2"
      />
      <path
        d="M29 53H43L49 41L58 63L65 51H82"
        stroke="#527c63"
        strokeWidth="2"
      />
    </svg>
  );
}
