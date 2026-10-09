import { z } from "zod";
export const adminIdentifier = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(200)
  .refine(
    (value) =>
      z.email().safeParse(value).success ||
      /^[a-z0-9][a-z0-9_.-]{2,63}$/.test(value),
    "Use an email address or a username of 3–64 characters.",
  );
