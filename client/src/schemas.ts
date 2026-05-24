import z from "zod";

export const searchSchema = z.object({
  posts: z.enum(["hot", "new", "top" ]).catch("hot"),
  time: z.enum(["hour", "day", "week", "month", "year", "all"]).catch("all"),
});
const categories = ["Posts", "Communities", "Saved"] as const;
export const userSearchSchema = z.object({
  tab: z.enum(categories).default("Posts"),
});