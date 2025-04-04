
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ExamAttempt } from '../types';
import { ExamAttemptsContextType } from '../contexts/types';
import { 
  fetchExamAttempts, 
  startExamAttemptService,
  submitExamAttemptService
} from '../services/ExamAttemptsService';

export function useExamAttempts(): ExamAttemptsContextType {
  const { currentUser } = useAuth();
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      loadExamAttempts();
    }
  }, [currentUser]);
  
  const loadExamAttempts = async () => {
    if (!currentUser) return;
    const data = await fetchExamAttempts(currentUser.id);
    setExamAttempts(data);
  };
  
  // This is a placeholder implementation since it will need to access the exams context
  const startExamAttempt = async (examId: string): Promise<string> => {
    if (!currentUser) throw new Error("User not authenticated");
    
    // This will be implemented when we integrate the contexts
    return '';
  };
  
  // This is a placeholder implementation since it will need to access the questions context
  const submitExamAttempt = async (
    attemptId: string, 
    answers: { questionId: string, selectedOptionId: string }[]
  ) => {
    if (!currentUser) return;
    
    // This will be implemented when we integrate the contexts
  };
  
  const getExamAttemptsForUser = (userId: string) => {
    return examAttempts.filter(attempt => attempt.userId === userId);
  };
  
  const getExamAttemptsForExam = (examId: string) => {
    return examAttempts.filter(attempt => attempt.examId === examId);
  };
  
  return {
    examAttempts,
    startExamAttempt,
    submitExamAttempt,
    getExamAttemptsForUser,
    getExamAttemptsForExam
  };
}
