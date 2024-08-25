import cors from "cors";
import express from "express";
import { loginSchema, signupSchema } from "./dtos/signupdtos";
import { login, refreshToken, signup } from "./handlers/auth/signup";
import { zodValidator } from "./middleware/ZodValidator";
import router from "./routes/room";
import { auth } from "./middleware/auth";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "https://sandeshthapa07.github.io/refreshfront/",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/login", zodValidator(loginSchema), login);
app.use("/signup", zodValidator(signupSchema), signup);
app.use("/refresh-token", refreshToken);

app.use("/api", auth, router);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
