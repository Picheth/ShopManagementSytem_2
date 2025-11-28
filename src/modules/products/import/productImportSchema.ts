import { z } from "zod";

export const ProductImportSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
	name: z.string().min(1, "Name is required"),
	brand: z.string().optional(),
	category: z.string().optional(),
	price: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().nonnegative().optional()),
	cost: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().nonnegative().optional()),
	stock: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().int().nonnegative().optional()),
	description: z.string().optional(),
});
