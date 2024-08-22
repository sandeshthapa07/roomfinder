import { Request } from "express";
declare module 'express-serve-static-core' {
    interface Request {
      user?: object; // or use a specific type for user if you have one
    }
  }