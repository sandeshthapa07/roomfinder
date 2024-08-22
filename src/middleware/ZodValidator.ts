import { NextFunction, Request, Response } from "express";
import { type ZodObject, z } from "zod";

export const zodValidator =
	(schema: ZodObject<any>) => (req: Request, res: Response, next:NextFunction) => {
		try {
			schema.parse(req.body);
			next();
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				return res.status(400).send({ msg: error.issues[0].message });
			}
			res.status(400).send(error.errors);
		}
	};
