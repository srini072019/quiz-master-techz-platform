
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';
import { CoursesContextType } from '../contexts/types';
import { toast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useCoursesHook(): CoursesContextType {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      loadCourses();
    }
  }, [currentUser]);
  
  const loadCourses = async () => {
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
          .map(cs => cs.subject_id);
        
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
      // We'll handle the exam check in DataContextRefactored
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
  
  const getCourseById = (id: string) => {
    return courses.find(course => course.id === id);
  };
  
  return {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourseById
  };
}
