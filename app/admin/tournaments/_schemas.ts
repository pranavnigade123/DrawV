// app/admin/tournaments/_schemas.ts
import { z } from "zod";

export const formatEnum = z.enum([
  "single_elim",
  "double_elim",
  "round_robin",
  "groups_playoffs",
]);

export const entryTypeEnum = z.enum(["solo", "team"]);

const isoDateOrEmpty = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : null))
  .refine((d) => d === null || !isNaN(d.getTime()), {
    message: "Invalid date",
  });

export const createTournamentSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    game: z.string().optional().nullable(),
    format: formatEnum,
    entryType: entryTypeEnum,

    // NEW: teamSize, numeric or null
    teamSize: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : null))
      .refine((n) => n === null || (Number.isInteger(n) && n >= 1), {
        message: "Team size must be a positive integer",
      }),

    registrationOpenAt: isoDateOrEmpty,
    registrationCloseAt: isoDateOrEmpty,
    startDate: isoDateOrEmpty,
    endDate: isoDateOrEmpty,
    maxParticipants: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : null))
      .refine((n) => n === null || (Number.isInteger(n) && n > 0), {
        message: "Max participants must be a positive integer",
      }),
    coverImage: z.string().url().optional().nullable().or(z.literal("").transform(() => null)),
    rules: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  })
  .superRefine((val, ctx) => {
    const { registrationOpenAt, registrationCloseAt, startDate, endDate } = val;

    if (registrationOpenAt && registrationCloseAt && registrationCloseAt < registrationOpenAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationCloseAt"],
        message: "Registration close must be after registration open.",
      });
    }
    if (startDate && endDate && endDate < startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be after start date.",
      });
    }
    if (registrationCloseAt && startDate && registrationCloseAt > startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationCloseAt"],
        message: "Registration close should be on or before event start.",
      });
    }

    // NEW: entryType-dependent teamSize rule
    if (val.entryType === "team" && (!val.teamSize || val.teamSize < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["teamSize"],
        message: "Team size must be at least 2 for team entry type.",
      });
    }
  });

export const updateTournamentSchema = createTournamentSchema.partial().extend({
  _atLeastOne: z.string().optional(),
});
