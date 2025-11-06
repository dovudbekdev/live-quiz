/*
  Warnings:

  - A unique constraint covering the columns `[socket_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "students_socket_id_key" ON "students"("socket_id");
