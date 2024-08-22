
import { Router } from "express";
import type { Request, Response } from "express";
import prisma from "../../db";
const router = Router();



const createRoom = async (req: Request, res: Response) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const { userId, email } = (req as unknown as Record<string, any>).user

    const { name } = await req.body

    try {
        const room = await prisma.room.create({
            data: {
                name,
                status: "AVAILABLE",
                distance: 0,
                location: "pepsicola",
                price: 0,
                rating: 3.5,
                description: "good",
                owner: {
                    connect: {
                        id: userId,
                        email
                    },
                },
                facilities: {
                    create: [
                        {
                            name: "wifi",
                            status: true,
                        },
                        {
                            name: "air conditioning",
                            status: true,
                        },
                    ],
                },
            },
            include: {
                facilities: true,
            },
        });

        res.status(200).json({ status: "success", data: room })
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ status: "error", message: "Failed to create room" })
    }
}


const allRooms = async (req: Request, res: Response) => {

    const rooms = await prisma.room.findMany({


        include: {
            owner: {
                select: {
                    name: true,
                    email: true
                },

            },
            facilities: true
        }
    })
    res.status(200).json({ status: "success", data: rooms })
}

const deleteAllRoom = async (req: Request, res: Response) => {

    await prisma.room.deleteMany()
    await prisma.user.deleteMany()

    res.status(200).json({ status: "success" })
}

const deleteRoom = async (req: Request, res: Response) => {
    const { id } = await req.params;

    const deleteRoom = await prisma.room.delete(
        {
            where: {
                id
            },

        }
    )

    res.status(200).json({ status: "Room deleted successfully.", data: deleteRoom })
}


const getRoom = async (req: Request, res: Response) => {
    const { id } = await req.params
    const room = await prisma.room.findUnique({
        where: {
            id
        }
        ,
        include: {
            owner: true
        }
    })
    res.status(200).json({ status: "success", data: room })
}

const updateRom = async (req: Request, res: Response) => {
    const { id } = req.params
    const { name } = req.body
    const room = await prisma.room.update({
        where: {
            id
        }
        , data: {
            name,
            status: "AVAILABLE",
            distance: 10,
            location: "pepsicola",
            price: 10000,
            rating: 3.5,
            description: "changed",
        }
    })

    res.status(200).json({ status: "Room updated successfully.", data: room })

}

router.get("/rooms", allRooms)
router.delete("/rooms", deleteAllRoom)

router.post("/room", createRoom)
router.put("/room/:id", updateRom)
router.get("/room/:id", getRoom)

router.delete("/room/:id", deleteRoom)




export default router