"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/components/demo-provider";
import { owners, taskSchema, type FollowUp } from "@/lib/model";
export function TaskForm({
  clientId,
  originType = "manual",
  originId,
  onDone,
}: {
  clientId?: string;
  originType?: FollowUp["originType"];
  originId?: string;
  onDone?: () => void;
}) {
  const { state, update } = useDemo();
  const router = useRouter();
  const [error, setError] = useState("");
  if (!state) return null;
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        const fields = new FormData(e.currentTarget);
        const result = taskSchema.safeParse({
          ...Object.fromEntries(fields),
          originType,
          originId,
        });
        if (!result.success) {
          setError(result.error.issues[0].message);
          return;
        }
        if (!state.clients.some((c) => c.id === result.data.clientId)) {
          setError("Select a valid client.");
          return;
        }
        const now = new Date().toISOString(),
          id = crypto.randomUUID();
        const task: FollowUp = {
          ...result.data,
          id,
          status: "OPEN",
          createdAt: now,
          updatedAt: now,
          activities: [
            {
              id: crypto.randomUUID(),
              action: "Created",
              note: "Follow-up confirmed by care manager.",
              actorId: "Sarah Mitchell",
              createdAt: now,
            },
          ],
        };
        update((s) => ({ ...s, followUps: [task, ...s.followUps] }));
        onDone?.();
        router.push(`/follow-ups/${id}`);
      }}
    >
      <label>
        Client
        <select name="clientId" required defaultValue={clientId || ""}>
          <option value="" disabled>
            Select client
          </option>
          {state.clients.map((c) => (
            <option value={c.id} key={c.id}>
              {c.displayName}
            </option>
          ))}
        </select>
      </label>
      <label>
        Task title
        <input
          name="title"
          required
          minLength={3}
          maxLength={180}
          placeholder="e.g. Check physiotherapy availability"
        />
      </label>
      <label className="full">
        Description / next step
        <textarea name="description" required minLength={3} maxLength={4000} />
      </label>
      <label>
        Owner
        <select name="ownerId" required defaultValue="">
          <option value="" disabled>
            Confirm owner
          </option>
          {owners.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label>
        Due date
        <input type="date" name="dueDate" required />
      </label>
      <label>
        Priority cue
        <select name="priority" defaultValue="medium">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <p className="muted">
        Origin:{" "}
        {originType === "manual"
          ? "Manual entry"
          : `${originType} · ${originId}`}
        . You confirm the owner and due date.
      </p>
      {error && (
        <p role="alert" className="error full">
          {error}
        </p>
      )}
      <div className="full">
        <button className="primary" type="submit">
          Create follow-up
        </button>
      </div>
    </form>
  );
}
