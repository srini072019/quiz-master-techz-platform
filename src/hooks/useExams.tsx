
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Exam } from '../types';
import { ExamsContextType } from '../contexts/types';
import { 
  fetchExams, 
  addExamService,
  updateExamService,
  deleteExamService
} from '../services/ExamsService';

export function useExams(): ExamsContextType {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      loadExams();
    }
  }, [currentUser]);
  
  const loadExams = async () => {
    const data = await fetchExams();
    setExams(data);
  };
  
  const addExam = async (exam: Omit<Exam, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    const newExam = await addExamService(exam, currentUser.id);
    if (newExam) {
      setExams(prev => [...prev, newExam]);
    }
  };
  
  const updateExam = async (exam: Exam) => {
    if (!currentUser) return;
    
    const success = await updateExamService(exam);
    if (success) {
      setExams(prev => 
        prev.map(e => e.id === exam.id ? exam : e)
      );
    }
  };
  
  const deleteExam = async (id: string) => {
    if (!currentUser) return;
    
    const examToDelete = exams.find(e => e.id === id);
    if (!examToDelete) return;
    
    const success = await deleteExamService(id, examToDelete.name);
    if (success) {
      setExams(prev => prev.filter(e => e.id !== id));
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
