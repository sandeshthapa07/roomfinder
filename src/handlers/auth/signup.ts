import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import prisma from "../../../db";

export const signup = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  // checking if user exists
  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userExists) {
    const conflict = res.status(409).json({ status: "User already exists." });
    return conflict;
  }

  // creating user
  await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
    },
  });

  res.status(200).json({ status: "Sign up successfully." });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  //   finding user

  if (!email || !password) {
    return res
      .status(401)
      .json({ msg: "Please login to access this resource" });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(401).json({ status: "Invalid credentials." });
  }

  // checking if user exists
  const isValid = await comparePassword(password, user?.password);

  if (!isValid) {
    const notFound = res.status(401).json({ status: "Invalid credentials." });
    return notFound;
  }

  const accessToken = createJWT(user, "1m");
  const refreshToken = createJWT(user, "15m");

  await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: {
      refreshToken,
    },
  });

  const httpOnlyCookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: 'roomfinder-hrx5.onrender.com', // Adjust this to match your backend domain
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })
    .json({ status: "Logged in successfully.", accessToken, refreshToken });
};

const createJWT = (
  user: {
    id: string;
    name: string;
    email: string;
    password: string;
    refreshToken: string | null;
  },
  expiresTime: string
) => {
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    process.env.JWT_SECRET!,
    {
      expiresIn: expiresTime,
    }
  );
  return token;
};

export const hashPassword = (password: string) => {
  const hashPassword = bcrypt.hash(password, 10);
  return hashPassword;
};

export const comparePassword = (password: string, hashPassword: string) => {
  const comparePassword = bcrypt.compare(password, hashPassword);
  return comparePassword;
};

export const refreshToken = async (req: Request, res: Response) => {
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  const incommingRefreshToken = req.cookies["refreshToken"] as string;
  console.log(incommingRefreshToken, "incommingRefreshToken");

  if (!incommingRefreshToken) {
    return res
      .status(401)
      .json({ msg: "Please login to access this resource" });
  }

  const decodedRefreshToken = jwt.verify(
    incommingRefreshToken,
    process.env.JWT_SECRET!
  ) as JwtPayload;

  const user = await prisma.user.findUnique({
    where: {
      id: decodedRefreshToken.userId,
    },
  });


  if (!user) {

    return res
      .status(401)
      .json({ msg: "Please login to access this resource" });
  }
  if (user?.refreshToken !== incommingRefreshToken) {
    return res
      .status(401)
      .json({ msg: "Please login to access this resource" });
  }


  const accessToken = createJWT(user, "1m");
  const refreshToken = createJWT(user, "15m");

  await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: {
      refreshToken,
    },
  });

  const httpOnlyCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: 'roomfinder-hrx5.onrender.com', // Adjust this to match your backend domain
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: '.onrender.com', // Adjust this to match your backend domain
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })
    .json({
      accessToken,
      refreshToken,
      status: "Access token refreshed successfully.",
    });
};
