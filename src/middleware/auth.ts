import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    return res.status(401).send({ msg: "Unauthorized" });
  }

  const [, token] = bearer.split(" ");
  if (!token) {
    return res.status(401).send({ msg: "Unauthorized" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as unknown as Record<string, unknown>).user = user;
    next();
  } catch (error) {
    console.log(error);

    return res.status(401).send({ msg: "Unauthorized" });
  }
};
