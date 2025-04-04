
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';
import { CoursesContextType } from '../contexts/types';
import { 
  fetchCourses, 
  addCourseService,
  updateCourseService,
  deleteCourseService
} from '../services/CoursesService';

export function useCourses(): CoursesContextType {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      loadCourses();
    }
  }, [currentUser]);
  
  const loadCourses = async () => {
    const data = await fetchCourses();
    setCourses(data);
  };
  
  const addCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    const newCourse = await addCourseService(course, currentUser.id);
    if (newCourse) {
      setCourses(prev => [...prev, newCourse]);
    }
  };
  
  const updateCourse = async (course: Course) => {
    if (!currentUser) return;
    
    const success = await updateCourseService(course);
    if (success) {
      setCourses(prev => 
        prev.map(c => c.id === course.id ? course : c)
      );
    }
  };
  
  const deleteCourse = async (id: string) => {
    if (!currentUser) return;
    
    const courseToDelete = courses.find(c => c.id === id);
    if (!courseToDelete) return;
    
    const success = await deleteCourseService(id, courseToDelete.name);
    if (success) {
      setCourses(prev => prev.filter(c => c.id !== id));
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
