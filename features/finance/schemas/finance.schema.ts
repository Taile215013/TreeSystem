import { z } from "zod";

export const expenseSchema = z.object({
  category: z.enum([
    "electric", 
    "water", 
    "internet", 
    "food", 
    "fuel", 
    "salary_fixed", 
    "salary_parttime", 
    "rent", 
    "marketing", 
    "maintenance", 
    "other"
  ]),
  type: z.enum(["fixed", "variable"]),
  status: z.enum(["paid", "pending"]),
  amount: z.coerce.number().min(0, "Số tiền không được âm"),
  expenseDate: z.date().default(() => new Date()),
  notes: z.string().optional().nullable(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
