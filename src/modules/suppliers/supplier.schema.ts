import { z } from "zod";

export const SupplierSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	address: z.string().optional(),
});
