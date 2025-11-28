import { z } from "zod";

export const ContactImportSchema = z.object({
	name: z.string().min(1, "Name is required"),
	relation: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
});
