
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ExamAttempt } from '../types';
import { ExamAttemptsContextType } from '../contexts/types';
import { toast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useExamAttemptsHook(): ExamAttemptsContextType {
  const { currentUser } = useAuth();
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      loadExamAttempts();
    }
  }, [currentUser]);
  
  const loadExamAttempts = async () => {
    if (!currentUser) return;
    
    try {
      // Get exam attempts for the current user
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('user_id', currentUser.id);
      
      if (attemptsError) throw attemptsError;
      
      // Get answers for these attempts
      const attemptIds = attemptsData.map(attempt => attempt.id);
      
      let answersData: any[] = [];
      if (attemptIds.length > 0) {
        const { data, error } = await supabase
          .from('attempt_answers')
          .select('*')
          .in('attempt_id', attemptIds);
        
        if (error) throw error;
        answersData = data || [];
      }
      
      // Map answers to attempts
      const attemptsWithAnswers = attemptsData.map(attempt => {
        const attemptAnswers = answersData
          .filter(answer => answer.attempt_id === attempt.id)
          .map(answer => ({
            questionId: answer.question_id,
            selectedOptionId: answer.selected_option_id
          }));
        
        return {
          id: attempt.id,
          examId: attempt.exam_id,
          userId: attempt.user_id,
          startTime: new Date(attempt.start_time),
          endTime: attempt.end_time ? new Date(attempt.end_time) : undefined,
          score: attempt.score,
          passed: attempt.passed,
          answers: attemptAnswers
        };
      });
      
      setExamAttempts(attemptsWithAnswers);
    } catch (error) {
      console.error('Error fetching exam attempts:', error);
    }
  };
  
  // These functions are implemented in the DataContextRefactored component
  const startExamAttempt = async (examId: string): Promise<string> => {
    // This will be implemented in DataContextRefactored
    if (!currentUser) throw new Error("User not authenticated");
    return '';
  };
  
  const submitExamAttempt = async (
    attemptId: string, 
    answers: { questionId: string, selectedOptionId: string }[]
  ) => {
    // This will be implemented in DataContextRefactored
    if (!currentUser) return;
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
