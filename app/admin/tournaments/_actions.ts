// app/admin/tournaments/_actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import { ensureAdmin } from "@/lib/authz";
import { toSlug } from "@/lib/slug";
import { createTournamentSchema } from "./_schemas";

// Normalize a date to end-of-day (23:59:59.999)
function toEndOfDay(d: Date | null): Date | null {
  if (!d) return null;
  const nd = new Date(d);
  nd.setHours(23, 59, 59, 999);
  return nd;
}

// CREATE
export async function createTournament(formData: FormData): Promise<void> {
  const session = await ensureAdmin();

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    game: (formData.get("game")?.toString() || null) as string | null,
    format: (formData.get("format")?.toString() || "single_elim") as any,
    entryType: (formData.get("entryType")?.toString() || "team") as any,

    // NEW
    teamSize: formData.get("teamSize")?.toString(),

    registrationOpenAt: formData.get("registrationOpenAt")?.toString(),
    registrationCloseAt: formData.get("registrationCloseAt")?.toString(),
    startDate: formData.get("startDate")?.toString(),
    endDate: formData.get("endDate")?.toString(),
    maxParticipants: formData.get("maxParticipants")?.toString(),
    coverImage: formData.get("coverImage")?.toString() ?? "",
    rules: formData.get("rules")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
  };

  const parsed = createTournamentSchema.safeParse(raw);
  if (!parsed.success) {
    const messages = parsed.error.issues.map(issue => issue.message).join("; ");
    throw new Error(messages || "Invalid input");
  }

  const {
    name,
    game,
    format,
    entryType,
    teamSize, // NEW: parsed numeric or null
    registrationOpenAt,
    registrationCloseAt,
    startDate,
    endDate,
    maxParticipants,
    coverImage,
    rules,
    description,
  } = parsed.data;

  const normRegistrationOpenAt = registrationOpenAt || null;
  const normRegistrationCloseAt = toEndOfDay(registrationCloseAt || null);
  const normStartDate = startDate || null;
  const normEndDate = toEndOfDay(endDate || null);

  await connectDB();

  // Unique slug
  let slug = toSlug(name);
  const existing = await Tournament.findOne({ slug }).select("_id").lean();
  if (existing) {
    let i = 2;
    while (await Tournament.findOne({ slug: `${slug}-${i}` }).select("_id").lean()) {
      i++;
    }
    slug = `${slug}-${i}`;
  }

  const status = "draft" as const;

  await Tournament.create({
    name,
    slug,
    game: game || null,
    format,
    entryType,
    teamSize: teamSize ?? null, // NEW

    registrationOpenAt: normRegistrationOpenAt,
    registrationCloseAt: normRegistrationCloseAt,
    startDate: normStartDate,
    endDate: normEndDate,
    maxParticipants,
    coverImage: coverImage || null,
    rules: rules || null,
    description: description || null,
    status,
    archivedAt: null,
    createdBy: session.user?.id || null,
  });

  revalidatePath("/admin/tournaments");
  revalidatePath("/tournaments");
  redirect("/admin/tournaments?created=1");
}

// UPDATE
export async function updateTournament(id: string, formData: FormData): Promise<void> {
  const session = await ensureAdmin();

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    game: (formData.get("game")?.toString() || null) as string | null,
    format: (formData.get("format")?.toString() || "single_elim") as any,
    entryType: (formData.get("entryType")?.toString() || "team") as any,

    // NEW
    teamSize: formData.get("teamSize")?.toString(),

    registrationOpenAt: formData.get("registrationOpenAt")?.toString(),
    registrationCloseAt: formData.get("registrationCloseAt")?.toString(),
    startDate: formData.get("startDate")?.toString(),
    endDate: formData.get("endDate")?.toString(),
    maxParticipants: formData.get("maxParticipants")?.toString(),
    coverImage: formData.get("coverImage")?.toString() ?? "",
    rules: formData.get("rules")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "draft",
  };

  const allowed = new Set(["draft", "open", "ongoing", "completed"]);
  if (!allowed.has(raw.status)) {
    throw new Error("Invalid status");
  }

  const parsed = createTournamentSchema.safeParse(raw);
  if (!parsed.success) {
    const messages = parsed.error.issues.map(issue => issue.message).join("; ");
    throw new Error(messages || "Invalid input");
  }

  const {
    name,
    game,
    format,
    entryType,
    teamSize, // NEW
    registrationOpenAt,
    registrationCloseAt,
    startDate,
    endDate,
    maxParticipants,
    coverImage,
    rules,
    description,
  } = parsed.data;

  const normRegistrationOpenAt = registrationOpenAt || null;
  const normRegistrationCloseAt = toEndOfDay(registrationCloseAt || null);
  const normStartDate = startDate || null;
  const normEndDate = toEndOfDay(endDate || null);

  await connectDB();

  await Tournament.findByIdAndUpdate(
    id,
    {
      name,
      game: game || null,
      format,
      entryType,
      teamSize: teamSize ?? null, // NEW
      registrationOpenAt: normRegistrationOpenAt,
      registrationCloseAt: normRegistrationCloseAt,
      startDate: normStartDate,
      endDate: normEndDate,
      maxParticipants,
      coverImage: coverImage || null,
      rules: rules || null,
      description: description || null,
      status: raw.status,
    },
    { new: false }
  );

  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${id}/edit`);
  redirect("/admin/tournaments?updated=1");
}
// ARCHIVE
export async function archiveTournament(id: string): Promise<void> {
  await ensureAdmin();
  await connectDB();
  await Tournament.findByIdAndUpdate(id, { archivedAt: new Date() });
  revalidatePath("/admin/tournaments");
  revalidatePath("/tournaments");
}

// UNARCHIVE (optional)
export async function unarchiveTournament(id: string): Promise<void> {
  await ensureAdmin();
  await connectDB();
  await Tournament.findByIdAndUpdate(id, { archivedAt: null });
  revalidatePath("/admin/tournaments");
  revalidatePath("/tournaments");
}

// DELETE (optional hard delete; use cautiously)
export async function deleteTournament(id: string): Promise<void> {
  await ensureAdmin();
  await connectDB();
  await Tournament.findByIdAndDelete(id);
  revalidatePath("/admin/tournaments");
  revalidatePath("/tournaments");
}

export async function restoreTournament(id: string): Promise<void> {
  await ensureAdmin();
  await connectDB();
  await Tournament.findByIdAndUpdate(id, { archivedAt: null });
  revalidatePath("/admin/tournaments/archived");
  revalidatePath("/admin/tournaments");
  revalidatePath("/tournaments");
}