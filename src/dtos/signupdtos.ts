import { z } from "zod";

export const signupSchema = z.object({
	name: z
		.string({ required_error: "Name is required" })
		.min(3, "Name must be at least 3 characters"),
	email: z
		.string({ required_error: "Email is required" })
		.email({ message: "Invalid email" }),
	password: z
		.string({ required_error: "Password is required" })
		.min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.email({ message: "Invalid email" }),
	password: z
		.string({ required_error: "Password is required" })
		.min(8, "Password must be at least 8 characters"),
});
