
import { supabase } from '@/integrations/supabase/client';
import { ExamAttempt, MCQQuestion } from '../types';
import { toast } from '../hooks/use-toast';

export async function fetchExamAttempts(userId: string): Promise<ExamAttempt[]> {
  try {
    // Get exam attempts for the user
    const { data: attemptsData, error: attemptsError } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', userId);
    
    if (attemptsError) {
      console.error('Error fetching exam attempts:', attemptsError);
      return [];
    }
    
    // Get answers for these attempts
    const attemptIds = attemptsData.map(attempt => attempt.id);
    
    let answersData: any[] = [];
    if (attemptIds.length > 0) {
      const { data, error } = await supabase
        .from('attempt_answers')
        .select('*')
        .in('attempt_id', attemptIds);
      
      if (error) {
        console.error('Error fetching attempt answers:', error);
      } else {
        answersData = data || [];
      }
    }
    
    // Map answers to attempts
    return attemptsData.map(attempt => {
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
  } catch (error) {
    console.error('Error in fetchExamAttempts:', error);
    return [];
  }
}

export async function startExamAttemptService(
  examId: string, 
  userId: string, 
  examName: string
): Promise<string> {
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
      toast({ title: "Resuming exam", description: `Continuing your existing attempt for ${examName}.` });
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
      description: "There was an error starting the exam."
    });
    throw error;
  }
}

export async function submitExamAttemptService(
  attemptId: string,
  examId: string,
  answers: { questionId: string, selectedOptionId: string }[],
  examQuestions: MCQQuestion[],
  passingPercentage: number
): Promise<{ score: number, passed: boolean }> {
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
    
    // Calculate score
    let correctAnswers = 0;
    answers.forEach(answer => {
      const question = examQuestions.find(q => q.id === answer.questionId);
      if (question) {
        const selectedOption = question.options.find(o => o.id === answer.selectedOptionId);
        if (selectedOption && selectedOption.isCorrect) {
          correctAnswers++;
        }
      }
    });
    
    const score = examQuestions.length > 0 
      ? (correctAnswers / examQuestions.length) * 100 
      : 0;
    
    const passed = score >= passingPercentage;
    
    // Update the attempt to mark it as completed
    const { error } = await supabase
      .from('exam_attempts')
      .update({
        end_time: new Date().toISOString(),
        score,
        passed
      })
      .eq('id', attemptId);
    
    if (error) throw error;
    
    toast({ 
      title: passed ? "Exam Passed!" : "Exam Completed", 
      description: `Score: ${score.toFixed(2)}%` 
    });
    
    return { score, passed };
  } catch (error) {
    console.error('Error submitting exam attempt:', error);
    toast({ 
      title: "Error submitting exam", 
      description: "There was an error submitting your exam answers." 
    });
    throw error;
  }
}
