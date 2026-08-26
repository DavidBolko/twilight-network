import z from "zod";

export const searchSchema = z.object({
  posts: z.enum(["hot", "new", "top" ]).catch("hot"),
  time: z.enum(["hour", "day", "week", "month", "year", "all"]).catch("all"),
});

const categories = ["Posts", "Communities", "Saved"] as const;
export const userSearchSchema = z.object({
  tab: z.enum(categories).default("Posts"),
});

const exploreTabs = ["Posts", "Communities" ] as const;
export const exploreSearchSchema = z.object({
  tab: z.enum(exploreTabs).default("Posts"),
});