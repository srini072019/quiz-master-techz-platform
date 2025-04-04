
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Exam, DifficultyLevel } from '../types';
import { ExamsContextType } from '../contexts/types';
import { toast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useExamsHook(): ExamsContextType {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      loadExams();
    }
  }, [currentUser]);
  
  const loadExams = async () => {
    try {
      // Get exams
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*');
      
      if (examsError) throw examsError;
      
      // Get exam subjects relationships
      const { data: examSubjectsData, error: examSubjectsError } = await supabase
        .from('exam_subjects')
        .select('*');
      
      if (examSubjectsError) throw examSubjectsError;
      
      // Get exam participants relationships
      const { data: examParticipantsData, error: examParticipantsError } = await supabase
        .from('exam_participants')
        .select('*');
      
      if (examParticipantsError) throw examParticipantsError;
      
      // Map relationships to exams
      const examsWithRelationships = examsData.map(exam => {
        const examSubjects = examSubjectsData
          .filter(es => es.exam_id === exam.id)
          .map(es => ({
            subjectId: es.subject_id,
            questionCount: es.question_count,
            difficulty: es.difficulty as DifficultyLevel | "mixed"
          }));
        
        const examParticipants = examParticipantsData
          .filter(ep => ep.exam_id === exam.id)
          .map(ep => ep.user_id);
        
        return {
          id: exam.id,
          name: exam.name,
          description: exam.description || '',
          courseId: exam.course_id,
          subjects: examSubjects,
          durationMinutes: exam.duration_minutes,
          passingPercentage: exam.passing_percentage,
          participants: examParticipants,
          scheduledDate: new Date(exam.scheduled_date),
          createdById: exam.created_by_id,
          createdAt: new Date(exam.created_at)
        };
      });
      
      setExams(examsWithRelationships);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };
  
  const addExam = async (exam: Omit<Exam, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    try {
      // First, insert the exam
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert({
          name: exam.name,
          description: exam.description,
          course_id: exam.courseId,
          duration_minutes: exam.durationMinutes,
          passing_percentage: exam.passingPercentage,
          scheduled_date: exam.scheduledDate.toISOString(),
          created_by_id: currentUser.id
        })
        .select()
        .single();
      
      if (examError) throw examError;
      
      // Then, insert the exam subjects
      if (exam.subjects && exam.subjects.length > 0) {
        const subjectsToInsert = exam.subjects.map(subject => ({
          exam_id: examData.id,
          subject_id: subject.subjectId,
          question_count: subject.questionCount,
          difficulty: subject.difficulty
        }));
        
        const { error: subjectsError } = await supabase
          .from('exam_subjects')
          .insert(subjectsToInsert);
        
        if (subjectsError) throw subjectsError;
      }
      
      // Then, insert the exam participants
      if (exam.participants && exam.participants.length > 0) {
        const participantsToInsert = exam.participants.map(userId => ({
          exam_id: examData.id,
          user_id: userId
        }));
        
        const { error: participantsError } = await supabase
          .from('exam_participants')
          .insert(participantsToInsert);
        
        if (participantsError) throw participantsError;
      }
      
      const newExam: Exam = {
        id: examData.id,
        name: examData.name,
        description: examData.description || '',
        courseId: examData.course_id,
        subjects: exam.subjects || [],
        durationMinutes: examData.duration_minutes,
        passingPercentage: examData.passing_percentage,
        participants: exam.participants || [],
        scheduledDate: new Date(examData.scheduled_date),
        createdById: examData.created_by_id,
        createdAt: new Date(examData.created_at)
      };
      
      setExams(prevExams => [...prevExams, newExam]);
      toast({ title: "Exam created", description: `${exam.name} has been created.` });
    } catch (error) {
      console.error('Error adding exam:', error);
      toast({
        title: "Error creating exam",
        description: "There was an error creating the exam.",
        variant: "destructive"
      });
    }
  };
  
  const updateExam = async (updatedExam: Exam) => {
    if (!currentUser) return;
    
    try {
      // Update the exam
      const { error: examError } = await supabase
        .from('exams')
        .update({
          name: updatedExam.name,
          description: updatedExam.description,
          course_id: updatedExam.courseId,
          duration_minutes: updatedExam.durationMinutes,
          passing_percentage: updatedExam.passingPercentage,
          scheduled_date: updatedExam.scheduledDate.toISOString()
        })
        .eq('id', updatedExam.id);
      
      if (examError) throw examError;
      
      // Delete existing exam subjects and participants
      const { error: deleteSubjectsError } = await supabase
        .from('exam_subjects')
        .delete()
        .eq('exam_id', updatedExam.id);
      
      if (deleteSubjectsError) throw deleteSubjectsError;
      
      const { error: deleteParticipantsError } = await supabase
        .from('exam_participants')
        .delete()
        .eq('exam_id', updatedExam.id);
      
      if (deleteParticipantsError) throw deleteParticipantsError;
      
      // Insert updated exam subjects
      if (updatedExam.subjects && updatedExam.subjects.length > 0) {
        const subjectsToInsert = updatedExam.subjects.map(subject => ({
          exam_id: updatedExam.id,
          subject_id: subject.subjectId,
          question_count: subject.questionCount,
          difficulty: subject.difficulty
        }));
        
        const { error: subjectsError } = await supabase
          .from('exam_subjects')
          .insert(subjectsToInsert);
        
        if (subjectsError) throw subjectsError;
      }
      
      // Insert updated exam participants
      if (updatedExam.participants && updatedExam.participants.length > 0) {
        const participantsToInsert = updatedExam.participants.map(userId => ({
          exam_id: updatedExam.id,
          user_id: userId
        }));
        
        const { error: participantsError } = await supabase
          .from('exam_participants')
          .insert(participantsToInsert);
        
        if (participantsError) throw participantsError;
      }
      
      setExams(prevExams =>
        prevExams.map(exam =>
          exam.id === updatedExam.id ? updatedExam : exam
        )
      );
      toast({ title: "Exam updated", description: `${updatedExam.name} has been updated.` });
    } catch (error) {
      console.error('Error updating exam:', error);
      toast({
        title: "Error updating exam",
        description: "There was an error updating the exam.",
        variant: "destructive"
      });
    }
  };
  
  const deleteExam = async (id: string) => {
    if (!currentUser) return;
    
    try {
      const examToDelete = exams.find(e => e.id === id);
      if (!examToDelete) return;
      
      // Delete all exam attempts for this exam
      const { error: deleteAttemptsError } = await supabase
        .from('exam_attempts')
        .delete()
        .eq('exam_id', id);
      
      if (deleteAttemptsError) throw deleteAttemptsError;
      
      // Delete the exam (cascading will handle relationships)
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setExams(prevExams => prevExams.filter(exam => exam.id !== id));
      toast({
        title: "Exam deleted",
        description: `${examToDelete.name} has been deleted.`
      });
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: "Error deleting exam",
        description: "There was an error deleting the exam.",
        variant: "destructive"
      });
    }
  };
  
  const getExamById = (id: string) => {
    return exams.find(exam => exam.id === id);
  };
  
  const getExamsForCourse = (courseId: string) => {
    return exams.filter(exam => exam.courseId === courseId);
  };
  
  return {
    exams,
    addExam,
    updateExam,
    deleteExam,
    getExamById,
    getExamsForCourse
  };
}
