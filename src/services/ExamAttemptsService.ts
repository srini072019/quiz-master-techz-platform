
import { supabase } from '@/integrations/supabase/client';
import { ExamAttempt, MCQQuestion } from '../types';
import { toast } from '../hooks/use-toast';

export const fetchExamAttempts = async (userId: string): Promise<ExamAttempt[]> => {
  try {
    // Get exam attempts for the user
    const { data: attemptsData, error: attemptsError } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', userId);
    
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
    
    return attemptsWithAnswers;
  } catch (error) {
    console.error('Error fetching exam attempts:', error);
    return [];
  }
};

export const startExamAttemptService = async (
  examId: string,
  userId: string,
  examName: string
): Promise<string> => {
  try {
    // Check if user already has an ongoing attempt
    const { data: existingAttempts, error: checkError } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .is('end_time', null)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "No rows found"
      throw checkError;
    }
    
    if (existingAttempts) {
      return existingAttempts.id;
    }
    
    // Create new attempt
    const { data, error } = await supabase
      .from('exam_attempts')
      .insert({
        exam_id: examId,
        user_id: userId,
        start_time: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast({ title: "Exam started", description: `${examName} has begun.` });
    
    return data.id;
  } catch (error) {
    console.error('Error starting exam attempt:', error);
    toast({ 
      title: "Error starting exam",
      description: "There was an error starting the exam attempt.",
      variant: "destructive"
    });
    throw error;
  }
};

export const submitExamAttemptService = async (
  attemptId: string, 
  examId: string, 
  answers: { questionId: string, selectedOptionId: string }[],
  examQuestions: MCQQuestion[],
  passingPercentage: number
): Promise<{score: number, passed: boolean}> => {
  try {
    // Insert answers
    if (answers.length > 0) {
      const answersToInsert = answers.map(answer => ({
        attempt_id: attemptId,
        question_id: answer.questionId,
        selected_option_id: answer.selectedOptionId
      }));
      
      const { error: answersError } = await supabase
        .from('attempt_answers')
        .insert(answersToInsert);
      
      if (answersError) throw answersError;
    }
    
    // Calculate score
    const correctAnswersCount = answers.filter(answer => {
      const question = examQuestions.find(q => q.id === answer.questionId);
      if (!question) return false;
      const correctOption = question.options.find(o => o.isCorrect);
      return correctOption?.id === answer.selectedOptionId;
    }).length;
    
    const totalQuestions = examQuestions.length;
    const score = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
    
    const passed = score >= passingPercentage;
    
    // Update attempt with end time, score and pass status
    const { error: updateError } = await supabase
      .from('exam_attempts')
      .update({
        end_time: new Date().toISOString(),
        score,
        passed
      })
      .eq('id', attemptId);
    
    if (updateError) throw updateError;
    
    toast({
      title: "Exam submitted",
      description: `You scored ${Math.round(score)}%. ${passed ? 'You passed!' : 'You did not pass.'}`
    });
    
    return { score, passed };
  } catch (error) {
    console.error('Error submitting exam attempt:', error);
    toast({
      title: "Error submitting exam",
      description: "There was an error submitting your exam.",
      variant: "destructive"
    });
    throw error;
  }
};
