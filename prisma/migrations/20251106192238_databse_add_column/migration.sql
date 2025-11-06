/*
  Warnings:

  - Added the required column `duration` to the `quizzes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finished_at` to the `results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `started_at` to the `results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "end_time" TIMESTAMP(3),
ADD COLUMN     "start_time" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "results" ADD COLUMN     "finished_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL;
