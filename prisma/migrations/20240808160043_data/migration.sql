-- CreateEnum
CREATE TYPE "Status" AS ENUM ('BOOKED', 'AVAILABLE');

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "price" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "owner" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "roomid" TEXT NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_roomid_fkey" FOREIGN KEY ("roomid") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
