/*
  Warnings:

  - Made the column `image` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
