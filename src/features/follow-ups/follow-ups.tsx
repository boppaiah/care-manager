"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/components/demo-provider";
import { Empty, Loading, PageHeader, Badge } from "@/components/ui";
import { isOverdue } from "@/lib/workflow";
import { today, formatDate } from "@/lib/dates";
import { statusLabel, owners, type Status } from "@/lib/model";
import { TaskForm } from "./task-form";
export function FollowUps({
  initiallyCreating = false,
}: {
  initiallyCreating?: boolean;
}) {
  const { state } = useDemo();
  const [show, setShow] = useState(initiallyCreating);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [owner, setOwner] = useState("All");
  const [due, setDue] = useState("");
  const [origin, setOrigin] = useState("All");
  if (!state) return <Loading />;
  const date = today();
  const tasks = state.followUps
    .filter((t) => {
      const c = state.clients.find((c) => c.id === t.clientId);
      return (
        `${t.title} ${c?.displayName}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "ALL" ||
          (filter === "OVERDUE" ? isOverdue(t, date) : filter === t.status)) &&
        (owner === "All" || t.ownerId === owner) &&
        (!due || t.dueDate <= due) &&
        (origin === "All" || origin === t.originType)
      );
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return (
    <>
      <PageHeader
        eyebrow="CLOSE THE LOOP"
        title="Follow-through"
        description="Every promise has an owner. Every action has a next step."
        action={
          <button className="primary" onClick={() => setShow(!show)}>
            {show ? "Close form" : "+ Create follow-up"}
          </button>
        }
      />
      <div className="stats">
        {["OPEN", "IN_PROGRESS", "BLOCKED", "OVERDUE", "RESOLVED"].map((s) => (
          <button
            className="stat"
            key={s}
            onClick={() => setFilter(filter === s ? "ALL" : s)}
          >
            <span>
              {s === "OVERDUE" ? "Overdue" : statusLabel(s as Status)}
            </span>
            <strong>
              {
                state.followUps.filter((t) =>
                  s === "OVERDUE" ? isOverdue(t, date) : t.status === s,
                ).length
              }
            </strong>
          </button>
        ))}
      </div>
      {show && (
        <section className="panel padded">
          <h2>Create a follow-up</h2>
          <TaskForm onDone={() => setShow(false)} />
        </section>
      )}
      <section className="panel">
        <div className="section-heading">
          <h2>Actions across your caseload</h2>
          <Badge>{tasks.length} actions</Badge>
        </div>
        <div className="filters">
          <label className="search">
            Search
            <input
              aria-label="Search actions"
              placeholder="Client or task title"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            Status
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {[
                "ALL",
                "OPEN",
                "IN_PROGRESS",
                "BLOCKED",
                "OVERDUE",
                "RESOLVED",
              ].map((s) => (
                <option key={s} value={s}>
                  {s === "ALL"
                    ? "All"
                    : s === "OVERDUE"
                      ? "Overdue"
                      : statusLabel(s as Status)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Owner
            <select value={owner} onChange={(e) => setOwner(e.target.value)}>
              {["All", ...owners].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label>
            Due by
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </label>
          <label>
            Origin
            <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
              {["All", "manual", "interaction", "observation"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        {tasks.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Action / client</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due / updated</th>
                  <th>Origin</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link
                        className="client-name"
                        href={`/follow-ups/${t.id}`}
                      >
                        {t.title}
                      </Link>
                      <small>
                        {
                          state.clients.find((c) => c.id === t.clientId)
                            ?.displayName
                        }
                      </small>
                    </td>
                    <td>{t.ownerId}</td>
                    <td>
                      <Badge
                        tone={
                          isOverdue(t, date)
                            ? "danger"
                            : t.status === "BLOCKED"
                              ? "amber"
                              : "green"
                        }
                      >
                        {statusLabel(t.status)}
                      </Badge>
                      {isOverdue(t, date) && (
                        <small className="overdue">Overdue</small>
                      )}
                    </td>
                    <td>
                      <span className={`priority ${t.priority}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      {formatDate(t.dueDate)}
                      <small>Updated {formatDate(t.updatedAt)}</small>
                    </td>
                    <td>
                      {t.originType === "manual"
                        ? "Manual entry"
                        : t.originType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No follow-ups match these filters.</Empty>
        )}
      </section>
      <p className="notice">
        Incidents, complaints and potential clinical risks must follow your
        provider’s formal escalation process. This worklist does not replace
        those registers.
      </p>
    </>
  );
}
