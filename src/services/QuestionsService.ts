
import { supabase } from '@/integrations/supabase/client';
import { MCQQuestion, MCQOption, DifficultyLevel } from '../types';
import { toast } from '../hooks/use-toast';

export const fetchQuestions = async (): Promise<MCQQuestion[]> => {
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
    
    return questionsWithOptions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

export const addQuestionService = async (
  question: Omit<MCQQuestion, 'id' | 'createdAt' | 'createdById'>,
  userId: string
): Promise<MCQQuestion | null> => {
  try {
    // First, insert the question
    const { data: questionData, error: questionError } = await supabase
      .from('mcq_questions')
      .insert({
        text: question.text,
        subject_id: question.subjectId,
        difficulty: question.difficulty,
        created_by_id: userId
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
    const formattedOptions: MCQOption[] = optionsData.map(option => ({
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
    
    toast({ title: "Question created", description: "New question has been added." });
    return newQuestion;
  } catch (error) {
    console.error('Error adding question:', error);
    toast({ 
      title: "Error creating question", 
      description: "There was an error creating the question.",
      variant: "destructive" 
    });
    return null;
  }
};

export const updateQuestionService = async (updatedQuestion: MCQQuestion): Promise<boolean> => {
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
    
    toast({ title: "Question updated", description: "Question has been updated." });
    return true;
  } catch (error) {
    console.error('Error updating question:', error);
    toast({ 
      title: "Error updating question", 
      description: "There was an error updating the question.",
      variant: "destructive" 
    });
    return false;
  }
};

export const deleteQuestionService = async (id: string): Promise<boolean> => {
  try {
    // Delete the question (cascading will handle options)
    const { error } = await supabase
      .from('mcq_questions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast({ title: "Question deleted", description: "Question has been deleted." });
    return true;
  } catch (error) {
    console.error('Error deleting question:', error);
    toast({ 
      title: "Error deleting question", 
      description: "There was an error deleting the question.",
      variant: "destructive" 
    });
    return false;
  }
};

export const getQuestionsForExamService = async (
  examId: string, 
  examSubjects: { subjectId: string, questionCount: number, difficulty: string }[],
  allQuestions: MCQQuestion[]
): Promise<MCQQuestion[]> => {
  let examQuestions: MCQQuestion[] = [];
  
  try {
    for (const subject of examSubjects) {
      const subjectQuestions = allQuestions.filter(q => 
        q.subjectId === subject.subjectId && 
        (subject.difficulty === 'mixed' || q.difficulty === subject.difficulty as DifficultyLevel)
      );
      
      // If we don't have enough questions cached, fetch more from the database
      if (subjectQuestions.length < subject.questionCount) {
        const { data, error } = await supabase
          .from('mcq_questions')
          .select('*')
          .eq('subject_id', subject.subjectId)
          .eq('difficulty', subject.difficulty === 'mixed' ? undefined : subject.difficulty)
          .limit(subject.questionCount);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Fetch options for these questions
          const questionIds = data.map(q => q.id);
          const { data: optionsData, error: optionsError } = await supabase
            .from('mcq_options')
            .select('*')
            .in('question_id', questionIds);
          
          if (optionsError) throw optionsError;
          
          const fetchedQuestions = data.map(question => {
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
          
          // Use fetched questions for this subject
          const randomizedQuestions = [...fetchedQuestions].sort(() => Math.random() - 0.5);
          examQuestions = [...examQuestions, ...randomizedQuestions.slice(0, subject.questionCount)];
        }
      } else {
        // We have enough cached questions, just randomize and take what we need
        const randomizedQuestions = [...subjectQuestions].sort(() => Math.random() - 0.5);
        examQuestions = [...examQuestions, ...randomizedQuestions.slice(0, subject.questionCount)];
      }
    }
    
    return examQuestions;
  } catch (error) {
    console.error('Error getting questions for exam:', error);
    toast({
      title: "Error loading exam questions",
      description: "There was an error loading the exam questions.",
      variant: "destructive"
    });
    return [];
  }
};
