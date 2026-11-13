import { isMatch } from "date-fns";
import { z } from "zod";

const text = z.string().trim().min(1);
const identifier = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => isMatch(value, "yyyy-MM-dd"), "Invalid calendar date");
export const webUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  }, "Expected an HTTP(S) URL without credentials");
export const articleSchema = z
  .object({
    id: identifier,
    lang: z.enum(["zh-TW", "en"]),
    slug: identifier,
    title: text,
    description: text,
    author_id: identifier,
    published_at: date,
    updated_at: date.optional(),
    topic: identifier,
    tags: z.array(text),
    cover: z
      .union([
        z.object({ path: text, alt: text, decorative: z.literal(false).optional() }).strict(),
        z.object({ path: text, alt: z.literal(""), decorative: z.literal(true) }).strict(),
      ])
      .optional(),
    cta: z
      .object({ kind: z.literal("beta_application"), target_id: z.literal("beta-interest") })
      .strict(),
    sources: z.array(webUrlSchema),
  })
  .strict()
  .refine((value) => !value.updated_at || value.updated_at >= value.published_at, {
    path: ["updated_at"],
    message: "updated_at must not precede published_at",
  });
const localizedText = z.object({ "zh-TW": text, en: text }).strict();
export const authorsSchema = z
  .array(
    z
      .object({
        id: identifier,
        name: localizedText,
        bio: localizedText,
      })
      .strict()
  )
  .min(1);
export const topicsSchema = z
  .array(z.object({ id: identifier, name: localizedText }).strict())
  .min(1);
export const baselineSchema = z.record(
  identifier,
  z
    .object({
      published_at: date,
      slugs: z.object({ "zh-TW": identifier, en: identifier }).strict(),
    })
    .strict()
);
export const approvalSchema = z.array(
  z
    .object({
      id: identifier,
      digest: z.string().regex(/^[a-f0-9]{64}$/),
      reviewer: text,
      evidence: text,
    })
    .strict()
);
export const ctaTargets = Object.freeze({ "beta-interest": "https://tally.so/r/44WXdk" });
export type ArticleType = z.infer<typeof articleSchema>;
export type ApprovalType = z.infer<typeof approvalSchema>[number];
