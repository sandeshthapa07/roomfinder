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
		const conflict = await res
			.status(409)
			.json({ status: "User already exists." });
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
		return res.status(401).json({ msg: "Please login to access this resource" })
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
		const notFound = await res
			.status(401)
			.json({ status: "Invalid credentials." });
		return notFound;
	}

	const accessToken = await createJWT(user, "15m");
	const refreshToken = await createJWT(user, "15d");

	await prisma.user.update({
		where: {
			id: user?.id
		},
		data: {
			refreshToken
		}
	})

	return res.status(200).json({ status: "Logged in successfully.", accessToken, refreshToken });
};

const createJWT = (user: { id: string; name: string; email: string; password: string; refreshToken: string | null; }, expiresTime: string) => {
	const token = jwt.sign(
		{ userId: user.id, email: user.email },
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		process.env.JWT_SECRET!, {
		expiresIn: expiresTime
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
	const { token: incommingRefreshToken } = req.body;
	// const incommingToken = req.cookies.refreshToken
	// console.log(incommingRefreshToken, "incomming")

	if (!incommingRefreshToken) {
		return res.status(401).json({ msg: "Please login to access this resource" });
	}


	const decodedRefreshToken = jwt.verify(incommingRefreshToken, process.env.JWT_SECRET as string) as JwtPayload;
	const user = await prisma.user.findUnique({
		where: {
			id: decodedRefreshToken.userId
		}
	})
	if (!user) {
		return res.status(401).json({ msg: "Please login to access this resource" });
	}
	if (user?.refreshToken !== incommingRefreshToken) {
		return res.status(401).json({ msg: "Please login to access this resource" });
	}

	const accessToken = await createJWT(user, "15m");
	const refreshToken = await createJWT(user, "15d");

	const httpOnlyCookieOptions = {
		httpOnly: true,
		secure: true
	};

	return res.status(200).cookie("refreshToken", refreshToken, httpOnlyCookieOptions).json({
		accessToken, refreshToken, status: "Access token refreshed successfully."
	});

}
