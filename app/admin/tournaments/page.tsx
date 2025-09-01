// app/admin/tournaments/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import AdminToolbar from "@/app/admin/admin-ui/AdminToolbar";

// Icons (Heroicons v2)
import { PencilSquareIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";

const PAGE_SIZE = 20;

function formatDate(d?: Date | null) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(d));
  } catch {
    return "—";
  }
}

function formatRange(start?: Date | null, end?: Date | null) {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s === "—" && e === "—") return "—";
  if (s !== "—" && e !== "—") return `${s} – ${e}`;
  return s !== "—" ? s : e;
}

export default async function TournamentsManagePage(props: {
  searchParams: Promise<{ page?: string; created?: string; updated?: string; archived?: string }>;
}) {
  const sp = await props.searchParams;

  const page = Math.max(parseInt(sp.page || "1", 10) || 1, 1);
  const skip = (page - 1) * PAGE_SIZE;

  const banner =
    sp.created
      ? "Tournament created."
      : sp.updated
      ? "Tournament updated successfully."
      : sp.archived
      ? "Tournament archived."
      : null;

  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") redirect("/");

  await connectDB();

  const [items, total] = await Promise.all([
    Tournament.find({ archivedAt: null })
      .select(
        "name game status registrationOpenAt registrationCloseAt startDate endDate slug createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Tournament.countDocuments({ archivedAt: null }),
  ]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <>
      <AdminToolbar title="Manage Tournaments" />

      {banner && (
        <div className="mb-3 rounded-lg border border-emerald-300/60 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {banner}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60">
        <div className="grid grid-cols-12 bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-500 px-4 py-2 rounded-t-2xl border-b border-zinc-200/70 dark:border-zinc-800/70">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Game</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Dates</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500">No tournaments found.</div>
        ) : (
          <ul className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
            {items.map((t: any) => (
              <li
                key={t._id.toString()}
                className="grid grid-cols-12 px-4 py-3 items-center text-sm"
              >
                <div className="col-span-5">
                  <div className="font-medium">
                    <Link
                      href={`/admin/tournaments/${t._id.toString()}/edit`}
                      className="hover:underline"
                      title="Edit tournament"
                    >
                      {t.name}
                    </Link>
                  </div>
                  <div className="text-xs text-zinc-500">slug: {t.slug || "—"}</div>
                </div>

                <div className="col-span-2">{t.game || "—"}</div>

                <div className="col-span-2">
                  <span
                    className={[
                      "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
                      t.status === "open"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : t.status === "ongoing"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                        : t.status === "completed"
                        ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                    ].join(" ")}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="col-span-2">
                  <div className="text-xs text-zinc-500">
                    Reg: {formatRange(t.registrationOpenAt, t.registrationCloseAt)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Event: {formatRange(t.startDate, t.endDate)}
                  </div>
                </div>

                <div className="col-span-1 text-right">
                  <div className="inline-flex items-center gap-2 sm:gap-3">
                    {/* Edit (as icon link) */}
                    <Link
                      href={`/admin/tournaments/${t._id.toString()}/edit`}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-100 hover:bg-indigo-50  dark:hover:bg-indigo-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      aria-label="Edit tournament"
                      title="Edit tournament"
                    >
                      <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                    </Link>

                    {/* Archive (server action) */}
                    <form
                      action={async () => {
                        "use server";
                        const { archiveTournament } = await import("./_actions");
                        await archiveTournament(t._id.toString());
                      }}
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-md p-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        title="Archive (hide from active list)"
                        aria-label="Archive tournament"
                      >
                        <ArchiveBoxIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-zinc-500">
            Page {page} of {totalPages} • {total} total
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/tournaments?page=${Math.max(page - 1, 1)}`}
              aria-disabled={page === 1}
              className={[
                "px-3 py-1.5 rounded-lg border",
                page === 1
                  ? "pointer-events-none opacity-40 border-zinc-300 dark:border-zinc-700"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-300 dark:border-zinc-700",
              ].join(" ")}
            >
              Prev
            </Link>
            <Link
              href={`/admin/tournaments?page=${page + 1}`}
              aria-disabled={page === totalPages}
              className={[
                "px-3 py-1.5 rounded-lg border",
                page === totalPages
                  ? "pointer-events-none opacity-40 border-zinc-300 dark:border-zinc-700"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-300 dark:border-zinc-700",
              ].join(" ")}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
