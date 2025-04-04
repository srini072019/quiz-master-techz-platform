
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ExamAttempt } from '../types';
import { ExamAttemptsContextType } from '../contexts/types';
import { 
  fetchExamAttempts,
  startExamAttemptService,
  submitExamAttemptService
} from '../services/ExamAttemptsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

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
  
  const startExamAttempt = async (examId: string): Promise<string> => {
    if (!currentUser) throw new Error("User not authenticated");
    
    try {
      const attemptId = await startExamAttemptService(examId, currentUser.id, '');
      
      // Update local state
      const newAttempt = {
        id: attemptId,
        examId: examId,
        userId: currentUser.id,
        startTime: new Date(),
        answers: []
      };
      
      setExamAttempts(prev => [...prev, newAttempt]);
      
      return attemptId;
    } catch (error) {
      console.error('Error starting exam attempt:', error);
      toast({
        title: "Error starting exam",
        description: "There was an error starting the exam.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const submitExamAttempt = async (
    attemptId: string, 
    answers: { questionId: string, selectedOptionId: string }[]
  ) => {
    if (!currentUser) return;
    
    try {
      // First, record the answers in the database
      await Promise.all(answers.map(answer => supabase
        .from('attempt_answers')
        .insert({
          attempt_id: attemptId,
          question_id: answer.questionId,
          selected_option_id: answer.selectedOptionId
        })
      ));
      
      // Update the attempt with end time
      const { error } = await supabase
        .from('exam_attempts')
        .update({
          end_time: new Date().toISOString(),
        })
        .eq('id', attemptId);
        
      if (error) throw error;
      
      // Refresh the attempts data
      await loadExamAttempts();
      
      toast({ 
        title: "Exam submitted",
        description: "Your exam has been submitted successfully."
      });
    } catch (error) {
      console.error('Error submitting exam attempt:', error);
      toast({
        title: "Error submitting exam",
        description: "There was an error submitting the exam.",
        variant: "destructive"
      });
    }
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
