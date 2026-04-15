import { z } from "zod";

export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const PaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  });

export type ApiError = z.infer<typeof ApiErrorSchema>;
