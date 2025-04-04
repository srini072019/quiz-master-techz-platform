
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MCQQuestion, DifficultyLevel } from '../types';
import { QuestionsContextType } from '../contexts/types';
import { toast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  getQuestionsForExamService 
} from '../services/QuestionsService';

export function useQuestionsHook(): QuestionsContextType {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      loadQuestions();
    }
  }, [currentUser]);
  
  const loadQuestions = async () => {
    try {
      // First get questions
      const { data: questionData, error: questionError } = await supabase
        .from('mcq_questions')
        .select('*');
      
      if (questionError) throw questionError;
      
      // Then get options for all questions
      const { data: optionsData, error: optionsError } = await supabase
        .from('mcq_options')
        .select('*');
      
      if (optionsError) throw optionsError;
      
      // Map options to their questions
      const questionsWithOptions = questionData.map(question => {
        const questionOptions = optionsData
          .filter(option => option.question_id === question.id)
          .map(option => ({
            id: option.id,
            text: option.text,
            isCorrect: option.is_correct
          }));
        
        return {
          id: question.id,
          text: question.text,
          options: questionOptions,
          difficulty: question.difficulty as DifficultyLevel,
          subjectId: question.subject_id,
          createdById: question.created_by_id,
          createdAt: new Date(question.created_at)
        };
      });
      
      setQuestions(questionsWithOptions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };
  
  const addQuestion = async (question: Omit<MCQQuestion, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    try {
      // First, insert the question
      const { data: questionData, error: questionError } = await supabase
        .from('mcq_questions')
        .insert({
          text: question.text,
          subject_id: question.subjectId,
          difficulty: question.difficulty,
          created_by_id: currentUser.id
        })
        .select()
        .single();
      
      if (questionError) throw questionError;
      
      // Then, insert the options
      const optionsToInsert = question.options.map(option => ({
        question_id: questionData.id,
        text: option.text,
        is_correct: option.isCorrect
      }));
      
      const { data: optionsData, error: optionsError } = await supabase
        .from('mcq_options')
        .insert(optionsToInsert)
        .select();
      
      if (optionsError) throw optionsError;
      
      // Map the response to our application's format
      const formattedOptions = optionsData.map(option => ({
        id: option.id,
        text: option.text,
        isCorrect: option.is_correct
      }));
      
      const newQuestion: MCQQuestion = {
        id: questionData.id,
        text: questionData.text,
        options: formattedOptions,
        difficulty: questionData.difficulty as DifficultyLevel,
        subjectId: questionData.subject_id,
        createdById: questionData.created_by_id,
        createdAt: new Date(questionData.created_at)
      };
      
      setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
      toast({ title: "Question created", description: "New question has been added." });
    } catch (error) {
      console.error('Error adding question:', error);
      toast({ 
        title: "Error creating question", 
        description: "There was an error creating the question.",
        variant: "destructive" 
      });
    }
  };
  
  const updateQuestion = async (updatedQuestion: MCQQuestion) => {
    if (!currentUser) return;
    
    try {
      // Update the question
      const { error: questionError } = await supabase
        .from('mcq_questions')
        .update({
          text: updatedQuestion.text,
          subject_id: updatedQuestion.subjectId,
          difficulty: updatedQuestion.difficulty
        })
        .eq('id', updatedQuestion.id);
      
      if (questionError) throw questionError;
      
      // Delete existing options and re-insert them
      const { error: deleteError } = await supabase
        .from('mcq_options')
        .delete()
        .eq('question_id', updatedQuestion.id);
      
      if (deleteError) throw deleteError;
      
      // Insert updated options
      const optionsToInsert = updatedQuestion.options.map(option => ({
        question_id: updatedQuestion.id,
        text: option.text,
        is_correct: option.isCorrect
      }));
      
      const { error: optionsError } = await supabase
        .from('mcq_options')
        .insert(optionsToInsert);
      
      if (optionsError) throw optionsError;
      
      // Refresh questions to get the updated data with new option IDs
      await loadQuestions();
      
      toast({ title: "Question updated", description: "Question has been updated." });
    } catch (error) {
      console.error('Error updating question:', error);
      toast({ 
        title: "Error updating question", 
        description: "There was an error updating the question.",
        variant: "destructive" 
      });
    }
  };
  
  const deleteQuestion = async (id: string) => {
    if (!currentUser) return;
    
    try {
      // Delete the question (cascading will handle options)
      const { error } = await supabase
        .from('mcq_questions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setQuestions(prevQuestions => prevQuestions.filter(question => question.id !== id));
      toast({ title: "Question deleted", description: "Question has been deleted." });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({ 
        title: "Error deleting question", 
        description: "There was an error deleting the question.",
        variant: "destructive" 
      });
    }
  };
  
  const getQuestionById = (id: string) => {
    return questions.find(question => question.id === id);
  };
  
  const getQuestionsForSubject = (subjectId: string) => {
    return questions.filter(question => question.subjectId === subjectId);
  };
  
  const getQuestionsForExam = async (examId: string) => {
    return getQuestionsForExamService(examId, questions);
  };
  
  return {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
    getQuestionsForSubject,
    getQuestionsForExam
  };
}
