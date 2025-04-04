
import { supabase } from '@/integrations/supabase/client';
import { MCQQuestion, MCQOption, DifficultyLevel, ExamSubject } from '../types';
import { toast } from '../hooks/use-toast';

export async function fetchQuestions(): Promise<MCQQuestion[]> {
  try {
    // First get questions
    const { data: questionData, error: questionError } = await supabase
      .from('mcq_questions')
      .select('*');
    
    if (questionError) {
      console.error('Error fetching questions:', questionError);
      return [];
    }
    
    // Then get options for all questions
    const { data: optionsData, error: optionsError } = await supabase
      .from('mcq_options')
      .select('*');
    
    if (optionsError) {
      console.error('Error fetching question options:', optionsError);
      return [];
    }
    
    // Map options to their questions
    return questionData.map(question => {
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
  } catch (error) {
    console.error('Error in fetchQuestions:', error);
    return [];
  }
}

export async function addQuestionService(
  question: Omit<MCQQuestion, 'id' | 'createdAt' | 'createdById'>, 
  userId: string
): Promise<MCQQuestion | null> {
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
}

export async function updateQuestionService(question: MCQQuestion): Promise<boolean> {
  try {
    // Update the question
    const { error: questionError } = await supabase
      .from('mcq_questions')
      .update({
        text: question.text,
        subject_id: question.subjectId,
        difficulty: question.difficulty
      })
      .eq('id', question.id);
    
    if (questionError) throw questionError;
    
    // Delete existing options and re-insert them
    const { error: deleteError } = await supabase
      .from('mcq_options')
      .delete()
      .eq('question_id', question.id);
    
    if (deleteError) throw deleteError;
    
    // Insert updated options
    const optionsToInsert = question.options.map(option => ({
      question_id: question.id,
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
}

export async function deleteQuestionService(id: string): Promise<boolean> {
  try {
    // Delete the question (cascade will handle options)
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
}

// New function to get questions for an exam
export async function getQuestionsForExamService(
  examId: string, 
  allQuestions: MCQQuestion[]
): Promise<MCQQuestion[]> {
  try {
    // First fetch exam subjects configuration
    const { data: examSubjectsData, error: examSubjectsError } = await supabase
      .from('exam_subjects')
      .select('*')
      .eq('exam_id', examId);
    
    if (examSubjectsError) {
      console.error('Error fetching exam subjects:', examSubjectsError);
      return [];
    }
    
    // Map to ExamSubject type
    const examSubjects: ExamSubject[] = examSubjectsData.map(es => ({
      subjectId: es.subject_id,
      questionCount: es.question_count,
      difficulty: es.difficulty as DifficultyLevel
    }));
    
    // Get questions for each subject based on configuration
    let examQuestions: MCQQuestion[] = [];
    
    for (const examSubject of examSubjects) {
      const subjectQuestions = allQuestions.filter(q => 
        q.subjectId === examSubject.subjectId && 
        q.difficulty === examSubject.difficulty
      );
      
      // Shuffle questions and pick the required count
      const shuffled = [...subjectQuestions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, examSubject.questionCount);
      
      examQuestions = [...examQuestions, ...selected];
    }
    
    return examQuestions;
  } catch (error) {
    console.error('Error in getQuestionsForExamService:', error);
    return [];
  }
}
