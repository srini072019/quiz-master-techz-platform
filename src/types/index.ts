
export type UserRole = "admin" | "instructor" | "participant";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  createdById: string;
  createdAt: Date;
}

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion {
  id: string;
  text: string;
  options: MCQOption[];
  difficulty: DifficultyLevel;
  subjectId: string;
  createdById: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  subjects: string[]; // Subject IDs
  participants: string[]; // User IDs
  createdById: string;
  createdAt: Date;
}

export interface ExamSubject {
  subjectId: string;
  questionCount: number;
  difficulty: DifficultyLevel | "mixed";
}

export interface Exam {
  id: string;
  name: string;
  description: string;
  courseId: string;
  subjects: ExamSubject[];
  durationMinutes: number;
  passingPercentage: number;
  participants: string[]; // User IDs
  scheduledDate: Date;
  createdById: string;
  createdAt: Date;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  score?: number;
  passed?: boolean;
  answers: {
    questionId: string;
    selectedOptionId: string;
  }[];
}
