import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  Subject, 
  MCQQuestion, 
  Course, 
  Exam,
  ExamAttempt,
  MCQOption,
  ExamSubject,
  DifficultyLevel
} from '../types';
import { toast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DataContextType } from './types';
import { getQuestionsForExamService } from '../services/QuestionsService';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);

  // Load data from Supabase when auth state changes
  useEffect(() => {
    if (currentUser) {
      fetchSubjects();
      fetchQuestions();
      fetchCourses();
      fetchExams();
      fetchExamAttempts();
    }
  }, [currentUser]);

  // Fetch functions to get data from Supabase
  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase.from('subjects').select('*');
      if (error) throw error;
      
      setSubjects(data.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        description: item.description || '',
        createdById: item.created_by_id,
        createdAt: new Date(item.created_at)
      })));
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchQuestions = async () => {
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

  const fetchCourses = async () => {
    try {
      // Get courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');
      
      if (coursesError) throw coursesError;
      
      // Get course subjects relationships
      const { data: courseSubjectsData, error: courseSubjectsError } = await supabase
        .from('course_subjects')
        .select('*');
      
      if (courseSubjectsError) throw courseSubjectsError;
      
      // Get course participants relationships
      const { data: courseParticipantsData, error: courseParticipantsError } = await supabase
        .from('course_participants')
        .select('*');
      
      if (courseParticipantsError) throw courseParticipantsError;
      
      // Map relationships to courses
      const coursesWithRelationships = coursesData.map(course => {
        const courseSubjects = courseSubjectsData
          .filter(cs => cs.course_id === course.id)
          .map(cs => cs.subject_id); // Fixed: removed extra backslash
        
        const courseParticipants = courseParticipantsData
          .filter(cp => cp.course_id === course.id)
          .map(cp => cp.user_id);
        
        return {
          id: course.id,
          name: course.name,
          code: course.code,
          description: course.description || '',
          subjects: courseSubjects,
          participants: courseParticipants,
          createdById: course.created_by_id,
          createdAt: new Date(course.created_at)
        };
      });
      
      setCourses(coursesWithRelationships);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchExams = async () => {
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
            difficulty: es.difficulty
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
  
  const fetchExamAttempts = async () => {
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

  // Subject functions
  const addSubject = async (subject: Omit<Subject, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: subject.name,
          code: subject.code,
          description: subject.description,
          created_by_id: currentUser.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newSubject: Subject = {
        id: data.id,
        name: data.name,
        code: data.code,
        description: data.description || '',
        createdById: data.created_by_id,
        createdAt: new Date(data.created_at)
      };
      
      setSubjects(prevSubjects => [...prevSubjects, newSubject]);
      toast({ title: "Subject created", description: `${subject.name} has been created successfully.` });
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({ 
        title: "Error creating subject", 
        description: "There was an error creating the subject.",
        variant: "destructive" 
      });
    }
  };

  const updateSubject = async (updatedSubject: Subject) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('subjects')
        .update({
          name: updatedSubject.name,
          code: updatedSubject.code,
          description: updatedSubject.description
        })
        .eq('id', updatedSubject.id);
      
      if (error) throw error;
      
      setSubjects(prevSubjects => 
        prevSubjects.map(subject => 
          subject.id === updatedSubject.id ? updatedSubject : subject
        )
      );
      
      toast({ title: "Subject updated", description: `${updatedSubject.name} has been updated.` });
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({ 
        title: "Error updating subject", 
        description: "There was an error updating the subject.",
        variant: "destructive" 
      });
    }
  };

  const deleteSubject = async (id: string) => {
    if (!currentUser) return;
    
    try {
      // Check if subject is used in any course
      const isUsedInCourse = courses.some(course => course.subjects.includes(id));
      
      if (isUsedInCourse) {
        toast({ 
          title: "Cannot delete subject", 
          description: "This subject is used in one or more courses.",
          variant: "destructive" 
        });
        return;
      }
      
      const subjectToDelete = subjects.find(s => s.id === id);
      if (!subjectToDelete) return;
      
      // Delete the subject (cascading will handle related questions)
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setSubjects(prevSubjects => prevSubjects.filter(subject => subject.id !== id));
      setQuestions(prevQuestions => prevQuestions.filter(q => q.subjectId !== id));
      
      toast({ 
        title: "Subject deleted", 
        description: `${subjectToDelete.name} has been deleted.` 
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({ 
        title: "Error deleting subject", 
        description: "There was an error deleting the subject.",
        variant: "destructive" 
      });
    }
  };

  // Question functions
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
      await fetchQuestions();
      
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

  // Course functions
  const addCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    try {
      // First, insert the course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          name: course.name,
          code: course.code,
          description: course.description,
          created_by_id: currentUser.id
        })
        .select()
        .single();
      
      if (courseError) throw courseError;
      
      // Then, insert the course subjects
      if (course.subjects && course.subjects.length > 0) {
        const subjectsToInsert = course.subjects.map(subjectId => ({
          course_id: courseData.id,
          subject_id: subjectId
        }));
        
        const { error: subjectsError } = await supabase
          .from('course_subjects')
          .insert(subjectsToInsert);
        
        if (subjectsError) throw subjectsError;
      }
      
      // Then, insert the course participants
      if (course.participants && course.participants.length > 0) {
        const participantsToInsert = course.participants.map(userId => ({
          course_id: courseData.id,
          user_id: userId
        }));
        
        const { error: participantsError } = await supabase
          .from('course_participants')
          .insert(participantsToInsert);
        
        if (participantsError) throw participantsError;
      }
      
      const newCourse: Course = {
        id: courseData.id,
        name: courseData.name,
        code: courseData.code,
        description: courseData.description || '',
        subjects: course.subjects || [],
        participants: course.participants || [],
        createdById: courseData.created_by_id,
        createdAt: new Date(courseData.created_at)
      };
      
      setCourses(prevCourses => [...prevCourses, newCourse]);
      toast({ title: "Course created", description: `${course.name} has been created.` });
    } catch (error) {
      console.error('Error adding course:', error);
      toast({ 
        title: "Error creating course", 
        description: "There was an error creating the course.",
        variant: "destructive" 
      });
    }
  };

  const updateCourse = async (updatedCourse: Course) => {
    if (!currentUser) return;
    
    try {
      // Update the course
      const { error: courseError } = await supabase
        .from('courses')
        .update({
          name: updatedCourse.name,
          code: updatedCourse.code,
          description: updatedCourse.description
        })
        .eq('id', updatedCourse.id);
      
      if (courseError) throw courseError;
      
      // Delete existing course subjects and participants
      const { error: deleteSubjectsError } = await supabase
        .from('course_subjects')
        .delete()
        .eq('course_id', updatedCourse.id);
      
      if (deleteSubjectsError) throw deleteSubjectsError;
      
      const { error: deleteParticipantsError } = await supabase
        .from('course_participants')
        .delete()
        .eq('course_id', updatedCourse.id);
      
      if (deleteParticipantsError) throw deleteParticipantsError;
      
      // Insert updated course subjects
      if (updatedCourse.subjects && updatedCourse.subjects.length > 0) {
        const subjectsToInsert = updatedCourse.subjects.map(subjectId => ({
          course_id: updatedCourse.id,
          subject_id: subjectId
        }));
        
        const { error: subjectsError } = await supabase
          .from('course_subjects')
          .insert(subjectsToInsert);
        
        if (subjectsError) throw subjectsError;
      }
      
      // Insert updated course participants
      if (updatedCourse.participants && updatedCourse.participants.length > 0) {
        const participantsToInsert = updatedCourse.participants.map(userId => ({
          course_id: updatedCourse.id,
          user_id: userId
        }));
        
        const { error: participantsError } = await supabase
          .from('course_participants')
          .insert(participantsToInsert);
        
        if (participantsError) throw participantsError;
      }
      
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === updatedCourse.id ? updatedCourse : course
        )
      );
      toast({ title: "Course updated", description: `${updatedCourse.name} has been updated.` });
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error updating course",
        description: "There was an error updating the course.",
        variant: "destructive"
      });
    }
  };

  const deleteCourse = async (id: string) => {
    if (!currentUser) return;
    
    try {
      // Check if course has exams
      const hasExams = exams.some(exam => exam.courseId === id);
      
      if (hasExams) {
        toast({
          title: "Cannot delete course",
          description: "This course has exams associated with it.",
          variant: "destructive"
        });
        return;
      }
      
      const courseToDelete = courses.find(c => c.id === id);
      if (!courseToDelete) return;
      
      // Delete the course (cascading will handle relationships)
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCourses(prevCourses => prevCourses.filter(course => course.id !== id));
      toast({
        title: "Course deleted",
        description: `${courseToDelete.name} has been deleted.`
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error deleting course",
        description: "There was an error deleting the course.",
        variant: "destructive"
      });
    }
  };

  // Exam functions
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

  // Exam attempt functions
  const startExamAttempt = async (examId: string): Promise<string> => {
    if (!currentUser) throw new Error("User not authenticated");
    
    const exam = exams.find(e => e.id === examId);
    if (!exam) throw new Error("Exam not found");
    
    // Check if user is allowed to take this exam
    if (!exam.participants.includes(currentUser.id)) {
      throw new Error("You are not assigned to this exam");
    }
    
    try {
      // Check if user already has an ongoing attempt
      const { data: existingAttempts, error: checkError } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('user_id', currentUser.id)
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
          user_id: currentUser.id,
          start_time: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newAttempt: ExamAttempt = {
        id: data.id,
        examId: data.exam_id,
        userId: data.user_id,
        startTime: new Date(data.start_time),
        answers: []
      };
      
      setExamAttempts(prevAttempts => [...prevAttempts, newAttempt]);
      toast({ title: "Exam started", description: `${exam.name} has begun.` });
      
      return data.id;
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

  // Add the missing getQuestionsForExam function
  const getQuestionsForExam = async (examId: string): Promise<MCQQuestion[]> => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return [];
    return getQuestionsForExamService(examId, questions);
  };
  
  // Complete the submitExamAttempt function
  const submitExamAttempt = async (
    attemptId: string, 
    answers: { questionId: string, selectedOptionId: string }[]
  ) => {
    if (!currentUser) return;
    
    const attempt = examAttempts.find(a => a.id === attemptId);
    if (!attempt) return;
    
    const exam = exams.find(e => e.id === attempt.examId);
    if (!exam) return;
    
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
      
      // Then get the exam questions
      const examQuestions = await getQuestionsForExam(attempt.examId);
      
      // Calculate score
      let correctAnswers = 0;
      answers.forEach(answer => {
        const question = examQuestions.find(q => q.id === answer.questionId);
        if (question) {
          const selectedOption = question.options.find(o => o.id === answer.selectedOptionId);
          if (selectedOption && selectedOption.isCorrect) {
            correct
