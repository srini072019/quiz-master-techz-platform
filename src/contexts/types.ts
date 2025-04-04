
import {
  Subject,
  MCQQuestion,
  Course,
  Exam,
  ExamAttempt
} from '../types';

export interface SubjectsContextType {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'createdById'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  getSubjectById: (id: string) => Subject | undefined;
}

export interface QuestionsContextType {
  questions: MCQQuestion[];
  addQuestion: (question: Omit<MCQQuestion, 'id' | 'createdAt' | 'createdById'>) => void;
  updateQuestion: (question: MCQQuestion) => void;
  deleteQuestion: (id: string) => void;
  getQuestionById: (id: string) => MCQQuestion | undefined;
  getQuestionsForSubject: (subjectId: string) => MCQQuestion[];
  getQuestionsForExam: (examId: string) => Promise<MCQQuestion[]>;
}

export interface CoursesContextType {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'createdById'>) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
}

export interface ExamsContextType {
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'createdById'>) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  getExamById: (id: string) => Exam | undefined;
  getExamsForCourse: (courseId: string) => Exam[];
}

export interface ExamAttemptsContextType {
  examAttempts: ExamAttempt[];
  startExamAttempt: (examId: string) => Promise<string>;
  submitExamAttempt: (attemptId: string, answers: { questionId: string, selectedOptionId: string }[]) => void;
  getExamAttemptsForUser: (userId: string) => ExamAttempt[];
  getExamAttemptsForExam: (examId: string) => ExamAttempt[];
}

export interface DataContextType extends 
  SubjectsContextType,
  QuestionsContextType,
  CoursesContextType,
  ExamsContextType,
  ExamAttemptsContextType {}
