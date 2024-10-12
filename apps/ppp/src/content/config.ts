import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import type { GenerateIdOptions } from "node_modules/astro/dist/content/loaders/glob";

function generateId({ data, entry }: GenerateIdOptions) {
  if (typeof data.slug === "string") {
    return data.slug;
  }
  const slug = entry
    .replaceAll(/\(.+?\)\//g, "")
    .replaceAll(/\/index\.mdx?/g, "");
  return slug;
}

const problems = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/problems",
    generateId,
  }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { problems };
