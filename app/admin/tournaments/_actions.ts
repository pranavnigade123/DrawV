"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import { toSlug } from "@/lib/slug";
import { ensureAdmin } from "@/lib/authz";
import { createTournamentSchema } from "./_schemas";

// Normalize a date to end-of-day (23:59:59.999)
function toEndOfDay(d: Date | null): Date | null {
  if (!d) return null;
  const nd = new Date(d);
  nd.setHours(23, 59, 59, 999);
  return nd;
}

export async function createTournament(formData: FormData): Promise<void> {
  const session = await ensureAdmin();

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    game: (formData.get("game")?.toString() || null) as string | null,
    format: (formData.get("format")?.toString() || "single_elim") as any,
    entryType: (formData.get("entryType")?.toString() || "team") as any,
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
    throw new Error(parsed.error.issues[0]?.message || "Invalid input");
  }

  const {
    name,
    game,
    format,
    entryType,
    registrationOpenAt,
    registrationCloseAt,
    startDate,
    endDate,
    maxParticipants,
    coverImage,
    rules,
    description,
  } = parsed.data;

  // Normalize close/end to end-of-day
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

  // Manual status only: default to draft
  const status = "draft" as const;

  await Tournament.create({
    name,
    slug,
    game: game || null,
    format,
    entryType,
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

export async function updateTournament(id: string, formData: FormData): Promise<void> {
  const session = await ensureAdmin();

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    game: (formData.get("game")?.toString() || null) as string | null,
    format: (formData.get("format")?.toString() || "single_elim") as any,
    entryType: (formData.get("entryType")?.toString() || "team") as any,
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

  // Validate status
  const allowed = new Set(["draft", "open", "ongoing", "completed"]);
  if (!allowed.has(raw.status)) {
    throw new Error("Invalid status");
  }

  // Validate/parse the rest with your Zod schema
  const parsed = createTournamentSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid input");
  }

  const {
    name,
    game,
    format,
    entryType,
    registrationOpenAt,
    registrationCloseAt,
    startDate,
    endDate,
    maxParticipants,
    coverImage,
    rules,
    description,
  } = parsed.data;

  // Normalize close/end to end-of-day
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
      registrationOpenAt: normRegistrationOpenAt,
      registrationCloseAt: normRegistrationCloseAt,
      startDate: normStartDate,
      endDate: normEndDate,
      maxParticipants,
      coverImage: coverImage || null,
      rules: rules || null,
      description: description || null,
      status: raw.status, // manual-only
    },
    { new: false }
  );

  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${id}/edit`);
  redirect("/admin/tournaments?updated=1");
}
