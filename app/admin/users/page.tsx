// app/admin/users/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import AdminToolbar from "@/app/admin/admin-ui/AdminToolbar";

type ApiUser = {
  name?: string | null;
  email: string;
  role: "admin" | "player" | "guest";
  provider?: string | null;
  createdAt: string;
};

function formatDate(d: string) {
  try { return new Date(d).toLocaleString(); } catch { return d; }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") redirect("/");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(sp?.limit ?? "20")));
  const q = (sp?.q ?? "").trim();
  const role = (sp?.role ?? "").trim();

  await connectDB();

  const filter: Record<string, any> = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { provider: { $regex: q, $options: "i" } },
    ];
  }
  if (role) filter.role = role;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("name email role provider createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const buildUrl = (overrides: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();
    next.set("page", String(overrides.page ?? page));
    next.set("limit", String(overrides.limit ?? limit));
    const nextQ = typeof overrides.q === "string" ? overrides.q : q;
    const nextRole = typeof overrides.role === "string" ? overrides.role : role;
    if (nextQ) next.set("q", nextQ);
    if (nextRole) next.set("role", nextRole);
    return `/admin/users?${next.toString()}`;
  };

  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-6">
      <AdminToolbar title="Tournament Applicants" />
      <form action="/admin/users" className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name, email, provider"
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
        <select
          name="role"
          defaultValue={role}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="player">Player</option>
          <option value="guest">Guest</option>
        </select>
        <select
          name="limit"
          defaultValue={String(limit)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Apply
        </button>
      </form>

      <div className="rounded-xl overflow-hidden border border-zinc-800/70">
        <div className="grid grid-cols-12 bg-zinc-900/60 text-xs text-zinc-500 px-4 py-2">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Provider</div>
          <div className="col-span-2">Created</div>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500">No users found.</div>
        ) : (
          <ul className="divide-y divide-zinc-800/70">
            {items.map((u: any, idx: number) => (
              <li key={`${u.email}-${idx}`} className="grid grid-cols-12 px-4 py-3 text-sm">
                <div className="col-span-3 text-white truncate">{u.name || "—"}</div>
                <div className="col-span-3 text-zinc-300 truncate">{u.email}</div>
                <div className="col-span-2">
                  <span className="inline-flex items-center rounded-md border border-zinc-700 px-2 py-0.5 text-xs text-zinc-200">
                    {u.role}
                  </span>
                </div>
                <div className="col-span-2 text-zinc-300 truncate">{u.provider || "—"}</div>
                <div className="col-span-2 text-zinc-400 truncate">{formatDate(u.createdAt)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
        <div>
          Page {page} of {totalPages} • {total} users
        </div>
        <div className="flex gap-2">
          <a
            aria-disabled={page <= 1}
            className={`px-3 py-1.5 rounded-lg border ${page <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-zinc-800"} border-zinc-700`}
            href={buildUrl({ page: Math.max(1, page - 1) })}
          >
            Prev
          </a>
          <a
            aria-disabled={page >= totalPages}
            className={`px-3 py-1.5 rounded-lg border ${page >= totalPages ? "opacity-50 pointer-events-none" : "hover:bg-zinc-800"} border-zinc-700`}
            href={buildUrl({ page: Math.min(totalPages, page + 1) })}
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
