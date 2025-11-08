export type EndQuizDto = {
  studentId?: number;
  teacherId?: number;
};

export type StrictEndQuizDto = Required<EndQuizDto>;
