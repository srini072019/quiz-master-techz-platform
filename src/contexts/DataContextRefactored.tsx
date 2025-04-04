
import React, { createContext, useContext } from 'react';
import { DataContextType } from './types';
import { useSubjects } from '../hooks/useSubjects';
import { useQuestions } from '../hooks/useQuestions';
import { useCourses } from '../hooks/useCourses';
import { useExams } from '../hooks/useExams';
import { useExamAttempts } from '../hooks/useExamAttempts';
import { MCQQuestion } from '../types';
import { getQuestionsForExamService } from '../services/QuestionsService';
import { startExamAttemptService, submitExamAttemptService } from '../services/ExamAttemptsService';
import { useAuth } from './AuthContext';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  const subjects = useSubjects();
  const questionsHook = useQuestions();
  const courses = useCourses();
  const examsHook = useExams();
  const examAttemptsHook = useExamAttempts();
  
  // Override the getQuestionsForExam function to use our combined context
  const getQuestionsForExam = async (examId: string): Promise<MCQQuestion[]> => {
    const exam = examsHook.getExamById(examId);
    if (!exam) return [];
    
    return getQuestionsForExamService(
      examId, 
      questionsHook.questions
    );
  };
  
  // Override the startExamAttempt function to use our combined context
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
  
  // Override the submitExamAttempt function to use our combined context
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
    const examQuestions = await getQuestionsForExam(attempt.examId);
    
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
  };
  
  // Combine all the contexts
  const contextValue: DataContextType = {
    ...subjects,
    ...questionsHook,
    ...courses,
    ...examsHook,
    ...examAttemptsHook,
    getQuestionsForExam,
    startExamAttempt,
    submitExamAttempt
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
