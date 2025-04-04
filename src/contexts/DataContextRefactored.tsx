
import React, { createContext, useContext } from 'react';
import { DataContextType } from './types';
import { useSubjectsHook } from '../hooks/useSubjectsHook';
import { useQuestionsHook } from '../hooks/useQuestionsHook';
import { useCoursesHook } from '../hooks/useCoursesHook';
import { useExamsHook } from '../hooks/useExamsHook';
import { useExamAttemptsHook } from '../hooks/useExamAttemptsHook';
import { MCQQuestion } from '../types';
import { startExamAttemptService, submitExamAttemptService } from '../services/ExamAttemptsService';
import { useAuth } from './AuthContext';
import { toast } from '../hooks/use-toast';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  const subjects = useSubjectsHook();
  const questionsHook = useQuestionsHook();
  const courses = useCoursesHook();
  const examsHook = useExamsHook();
  const examAttemptsHook = useExamAttemptsHook();
  
  // Override the deleteSubject function to check if the subject is used in courses
  const deleteSubject = async (id: string) => {
    // Check if subject is used in any course
    const isUsedInCourse = courses.courses.some(course => course.subjects.includes(id));
    
    if (isUsedInCourse) {
      toast({ 
        title: "Cannot delete subject", 
        description: "This subject is used in one or more courses.",
        variant: "destructive" 
      });
      return;
    }
    
    // If not used, proceed with deletion
    await subjects.deleteSubject(id);
    
    // Also filter out questions with this subject ID
    questionsHook.questions
      .filter(q => q.subjectId === id)
      .forEach(q => questionsHook.deleteQuestion(q.id));
  };
  
  // Override the deleteCourse function to check if the course has exams
  const deleteCourse = async (id: string) => {
    // Check if course has exams
    const hasExams = examsHook.exams.some(exam => exam.courseId === id);
    
    if (hasExams) {
      toast({
        title: "Cannot delete course",
        description: "This course has exams associated with it.",
        variant: "destructive"
      });
      return;
    }
    
    // If no exams, proceed with deletion
    await courses.deleteCourse(id);
  };
  
  // Override the startExamAttempt function to use the combined context
  const startExamAttempt = async (examId: string): Promise<string> => {
    if (!currentUser) throw new Error("User not authenticated");
    
    const exam = examsHook.getExamById(examId);
    if (!exam) throw new Error("Exam not found");
    
    // Check if user is allowed to take this exam
    if (!exam.participants.includes(currentUser.id)) {
      throw new Error("You are not assigned to this exam");
    }
    
    const attemptId = await startExamAttemptService(examId, currentUser.id, exam.name);
    
    // Update local state
    const newAttempt = {
      id: attemptId,
      examId: examId,
      userId: currentUser.id,
      startTime: new Date(),
      answers: []
    };
    
    examAttemptsHook.examAttempts.push(newAttempt);
    
    return attemptId;
  };
  
  // Override the submitExamAttempt function to use the combined context
  const submitExamAttempt = async (
    attemptId: string, 
    answers: { questionId: string, selectedOptionId: string }[]
  ) => {
    if (!currentUser) return;
    
    const attempt = examAttemptsHook.examAttempts.find(a => a.id === attemptId);
    if (!attempt) return;
    
    const exam = examsHook.getExamById(attempt.examId);
    if (!exam) return;
    
    // Get exam questions
    const examQuestions = await questionsHook.getQuestionsForExam(attempt.examId);
    
    // Submit the attempt
    const { score, passed } = await submitExamAttemptService(
      attemptId,
      attempt.examId,
      answers,
      examQuestions,
      exam.passingPercentage
    );
    
    // Update local state
    const updatedAttempts = examAttemptsHook.examAttempts.map(a => {
      if (a.id === attemptId) {
        return {
          ...a,
          endTime: new Date(),
          score,
          passed,
          answers
        };
      }
      return a;
    });
    
    // Replace the old attempts array with the updated one
    examAttemptsHook.examAttempts.splice(0, examAttemptsHook.examAttempts.length);
    updatedAttempts.forEach(attempt => examAttemptsHook.examAttempts.push(attempt));
    
    toast({ 
      title: passed ? "Exam passed!" : "Exam failed", 
      description: `Your score: ${score.toFixed(1)}%. ${passed ? 'Congratulations!' : 'Please try again.'}`,
      variant: passed ? "default" : "destructive"
    });
  };
  
  // Combine all the contexts
  const contextValue: DataContextType = {
    subjects: subjects.subjects,
    questions: questionsHook.questions,
    courses: courses.courses,
    exams: examsHook.exams,
    examAttempts: examAttemptsHook.examAttempts,
    addSubject: subjects.addSubject,
    updateSubject: subjects.updateSubject,
    deleteSubject: deleteSubject,
    addQuestion: questionsHook.addQuestion,
    updateQuestion: questionsHook.updateQuestion,
    deleteQuestion: questionsHook.deleteQuestion,
    addCourse: courses.addCourse,
    updateCourse: courses.updateCourse,
    deleteCourse: deleteCourse,
    addExam: examsHook.addExam,
    updateExam: examsHook.updateExam,
    deleteExam: examsHook.deleteExam,
    startExamAttempt,
    submitExamAttempt,
    getSubjectById: subjects.getSubjectById,
    getQuestionById: questionsHook.getQuestionById,
    getCourseById: courses.getCourseById,
    getExamById: examsHook.getExamById,
    getExamAttemptsForUser: examAttemptsHook.getExamAttemptsForUser,
    getExamAttemptsForExam: examAttemptsHook.getExamAttemptsForExam,
    getQuestionsForSubject: questionsHook.getQuestionsForSubject,
    getExamsForCourse: examsHook.getExamsForCourse,
    getQuestionsForExam: questionsHook.getQuestionsForExam
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
}
