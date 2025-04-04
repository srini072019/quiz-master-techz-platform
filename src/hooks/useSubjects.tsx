
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Subject } from '../types';
import { SubjectsContextType } from '../contexts/types';
import { 
  fetchSubjects, 
  addSubjectService,
  updateSubjectService,
  deleteSubjectService
} from '../services/SubjectsService';

export function useSubjects(): SubjectsContextType {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      loadSubjects();
    }
  }, [currentUser]);
  
  const loadSubjects = async () => {
    const data = await fetchSubjects();
    setSubjects(data);
  };
  
  const addSubject = async (subject: Omit<Subject, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    const newSubject = await addSubjectService(subject, currentUser.id);
    if (newSubject) {
      setSubjects(prev => [...prev, newSubject]);
    }
  };
  
  const updateSubject = async (subject: Subject) => {
    if (!currentUser) return;
    
    const success = await updateSubjectService(subject);
    if (success) {
      setSubjects(prev => 
        prev.map(s => s.id === subject.id ? subject : s)
      );
    }
  };
  
  const deleteSubject = async (id: string) => {
    if (!currentUser) return;
    
    const subjectToDelete = subjects.find(s => s.id === id);
    if (!subjectToDelete) return;
    
    const success = await deleteSubjectService(id, subjectToDelete.name);
    if (success) {
      setSubjects(prev => prev.filter(s => s.id !== id));
    }
  };
  
  const getSubjectById = (id: string) => {
    return subjects.find(subject => subject.id === id);
  };
  
  return {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectById
  };
}
