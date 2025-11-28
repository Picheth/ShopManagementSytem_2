import { z } from "zod";


export const productSchema = z.object({
sku: z.string().min(1, "SKU is required"),
name: z.string().min(1, "Name is required"),
brand: z.string().optional().nullable(),
category: z.string().optional().nullable(),
price: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().nonnegative().optional()),
cost: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().nonnegative().optional()),
stock: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().int().nonnegative().optional()),
description: z.string().optional().nullable(),
});


export const supplierSchema = z.object({
name: z.string().min(1),
email: z.string().email().optional(),
phone: z.string().optional(),
address: z.string().optional(),
});


export const customerSchema = supplierSchema.extend({});
export const contactSchema = z.object({ name: z.string().min(1), relation: z.string().optional(), phone: z.string().optional(), email: z.string().optional() });


// Helper to validate rows and return enriched result
export function validateRows<T>(rows: any[], schema: z.ZodTypeAny) {
const valid: T[] = [];
const invalid: { row: any; errors: any; index: number }[] = [];


rows.forEach((r, idx) => {
const parsed = schema.safeParse(r);
if (parsed.success) {
valid.push(parsed.data as T);
} else {
invalid.push({ row: r, errors: parsed.error.format(), index: idx });
}
});


return { valid, invalid };
}