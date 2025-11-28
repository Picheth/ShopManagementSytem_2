// Example: Zod schema for Product validation
import { z } from "zod";

export const ProductSchema = z.object({
	sku: z.string(),
	name: z.string(),
	brand: z.string().optional(),
	category: z.string().optional(),
	price: z.number().optional(),
	cost: z.number().optional(),
	stock: z.number().optional(),
	description: z.string().optional(),
});
