-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('student', 'dropout', 'alumni', 'explorer');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "role" "ROLE" NOT NULL,
    "name" VARCHAR(100),
    "username" VARCHAR(100) NOT NULL,
    "bio" VARCHAR(300) NOT NULL,
    "college" VARCHAR(100) NOT NULL,
    "collegeEmail" VARCHAR(150),
    "graduationYear" INTEGER NOT NULL,
    "mana" INTEGER NOT NULL,
    "earnedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "badges" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Users" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Users_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_bio_key" ON "Users"("bio");

-- CreateIndex
CREATE INDEX "_Users_B_index" ON "_Users"("B");

-- AddForeignKey
ALTER TABLE "_Users" ADD CONSTRAINT "_Users_A_fkey" FOREIGN KEY ("A") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Users" ADD CONSTRAINT "_Users_B_fkey" FOREIGN KEY ("B") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
