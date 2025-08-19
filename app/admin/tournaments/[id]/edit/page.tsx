// app/admin/tournaments/[id]/edit/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import { updateTournament } from "../../_actions";
import AdminToolbar from "@/app/admin/admin-ui/AdminToolbar";

function toInputDate(d?: Date | null) {
  if (!d) return "";
  const nd = new Date(d);
  const y = nd.getFullYear();
  const m = String(nd.getMonth() + 1).padStart(2, "0");
  const day = String(nd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Field({
  label,
  htmlFor,
  help,
  children,
  required,
}: {
  label: string;
  htmlFor?: string;
  help?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200"
      >
        {label}
        {required ? <span className="text-rose-600">*</span> : null}
      </label>
      {children}
      {help ? (
        <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{help}</p>
      ) : null}
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 p-4 md:p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

export default async function EditTournamentPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") redirect("/");

  await connectDB();
  const t = await Tournament.findById(id).lean();

  if (!t) {
    redirect("/admin/tournaments?deleted=1");
  }

  return (
    <>
      {/* Top admin navbar */}
      <AdminToolbar title="Edit Tournament" />

      <div className="mx-auto max-w-5xl space-y-5 px-3 md:px-0 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {(t as any).name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Update tournament details and set status manually.
            </p>
          </div>
          {/* Spacer to balance header since we removed the back link */}
          <div className="w-24" />
        </div>

        <form
          action={async (formData) => {
            "use server";
            await updateTournament(id, formData);
          }}
          className="space-y-5"
        >
          {/* Core details */}
          <Card title="Core details" description="Name, game, and basic configuration.">
            <Field label="Name" htmlFor="name" required>
              <input
                id="name"
                type="text"
                name="name"
                defaultValue={(t as any).name}
                required
                placeholder="e.g., Symbiosis Valorant Cup 2025"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </Field>

            <Field label="Game" htmlFor="game" help="Optional.">
              <input
                id="game"
                type="text"
                name="game"
                defaultValue={(t as any).game || ""}
                placeholder="e.g., Valorant, BGMI, CS2"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </Field>

            <Field label="Format" htmlFor="format">
              <select
                id="format"
                name="format"
                defaultValue={(t as any).format}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="single_elim">Single elimination</option>
                <option value="double_elim">Double elimination</option>
                <option value="round_robin">Round robin</option>
                <option value="groups_playoffs">Groups + Playoffs</option>
              </select>
            </Field>

            <Field label="Entry type" htmlFor="entryType">
              <select
                id="entryType"
                name="entryType"
                defaultValue={(t as any).entryType}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="team">Team</option>
                <option value="solo">Solo</option>
              </select>
            </Field>
          </Card>

          {/* Timeline */}
          <Card
            title="Timeline"
            description="Registration and event dates. Close and end are saved as end-of-day."
          >
            <Field label="Registration open" htmlFor="registrationOpenAt">
              <input
                id="registrationOpenAt"
                type="date"
                name="registrationOpenAt"
                defaultValue={toInputDate((t as any).registrationOpenAt)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </Field>

            <Field label="Registration close" htmlFor="registrationCloseAt" help="Inclusive of the whole day.">
              <input
                id="registrationCloseAt"
                type="date"
                name="registrationCloseAt"
                defaultValue={toInputDate((t as any).registrationCloseAt)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </Field>

            <Field label="Event start" htmlFor="startDate">
              <input
                id="startDate"
                type="date"
                name="startDate"
                defaultValue={toInputDate((t as any).startDate)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </Field>

            <Field label="Event end" htmlFor="endDate" help="Inclusive of the whole day.">
              <input
                id="endDate"
                type="date"
                name="endDate"
                defaultValue={toInputDate((t as any).endDate)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </Field>
          </Card>

          {/* Details */}
          <Card title="Details" description="Optional details for participants.">
            <Field label="Max participants" htmlFor="maxParticipants" help="Leave empty for unlimited.">
              <input
                id="maxParticipants"
                type="number"
                name="maxParticipants"
                min={1}
                defaultValue={(t as any).maxParticipants ?? ""}
                placeholder="e.g., 32"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </Field>

            <Field label="Cover image URL" htmlFor="coverImage" help="Used for banners or cards.">
              <input
                id="coverImage"
                type="url"
                name="coverImage"
                defaultValue={(t as any).coverImage || ""}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Rules" htmlFor="rules" help="Markdown/plain text supported.">
                <textarea
                  id="rules"
                  name="rules"
                  rows={6}
                  defaultValue={(t as any).rules || ""}
                  placeholder="Key rules, format, penalties, pauses, etc."
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Description" htmlFor="description" help="Short summary for the detail page.">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={(t as any).description || ""}
                  placeholder="Overview, stream info, contact, etc."
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </Field>
            </div>
          </Card>

          {/* Status */}
          <Card title="Status" description="Manual status only. Change as the tournament progresses.">
            <div className="md:col-span-2">
              <Field label="Status (manual)" htmlFor="status">
                <select
                  id="status"
                  name="status"
                  defaultValue={(t as any).status}
                  className="w-full md:w-64 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </Field>
            </div>
          </Card>

          {/* Footer actions */}
          <div className="sticky bottom-0 z-10 -mx-3 md:mx-0 bg-gradient-to-t from-white/90 dark:from-zinc-950/90 to-transparent pt-4">
            <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 p-3 flex items-center justify-end gap-2">
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
