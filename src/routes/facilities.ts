import prisma from "../../db"

import { Router } from "express";
import type { Request, Response } from "express";


const facilities = Router();

const createFacilities = async (req: Request, res: Response) => {

    const { name } = await req.body

    const facilities = await prisma.facility.create({
        data: {
            name,
            status: true,
           roomid:"1"
        }
    })

}