
import { supabase } from '@/integrations/supabase/client';
import { MCQQuestion } from '@/types';

export async function startExamAttemptService(
  examId: string, 
  userId: string,
  examName: string
): Promise<string> {
  try {
    // Check if there's an existing attempt
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
      console.log('Resuming existing attempt:', existingAttempts.id);
      return existingAttempts.id;
    }
    
    // Create a new attempt
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
    console.log('New attempt created:', data.id, 'for exam:', examName);
    
    return data.id;
  } catch (error) {
    console.error('Error starting exam attempt:', error);
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
    // Record answers in database
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
    
    const totalQuestions = answers.length;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passed = score >= passingPercentage;
    
    // Update attempt with score and end time
    const { error: updateError } = await supabase
      .from('exam_attempts')
      .update({
        end_time: new Date().toISOString(),
        score: score,
        passed: passed
      })
      .eq('id', attemptId);
    
    if (updateError) throw updateError;
    
    return { score, passed };
  } catch (error) {
    console.error('Error submitting exam attempt:', error);
    throw error;
  }
}
