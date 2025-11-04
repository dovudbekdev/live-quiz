/*
  Warnings:

  - You are about to drop the column `title` on the `quizzes` table. All the data in the column will be lost.
  - Added the required column `type` to the `quizzes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('INDIVIDUAL', 'TEAM');

-- DropIndex
DROP INDEX "public"."quizzes_title_key";

-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "title",
ADD COLUMN     "type" "QuizType" NOT NULL;
