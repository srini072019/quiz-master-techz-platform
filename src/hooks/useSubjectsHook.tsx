
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Subject } from '../types';
import { SubjectsContextType } from '../contexts/types';
import { toast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useSubjectsHook(): SubjectsContextType {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      loadSubjects();
    }
  }, [currentUser]);
  
  const loadSubjects = async () => {
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
      // We'll need to check this at the DataContextRefactored level
      // since we need access to courses
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
