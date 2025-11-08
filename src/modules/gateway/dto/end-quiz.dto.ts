export type EndQuizDto = {
  studentId?: number;
  teacherId?: number;
  quizId: number;
};

export type StrictEndQuizDto = Required<EndQuizDto>;
