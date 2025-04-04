
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '../types';
import { toast } from '../hooks/use-toast';

export const fetchSubjects = async (): Promise<Subject[]> => {
  try {
    const { data, error } = await supabase.from('subjects').select('*');
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      code: item.code,
      description: item.description || '',
      createdById: item.created_by_id,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

export const addSubjectService = async (
  subject: Omit<Subject, 'id' | 'createdAt' | 'createdById'>,
  userId: string
): Promise<Subject | null> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name: subject.name,
        code: subject.code,
        description: subject.description,
        created_by_id: userId
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
    
    toast({ title: "Subject created", description: `${subject.name} has been created successfully.` });
    return newSubject;
  } catch (error) {
    console.error('Error adding subject:', error);
    toast({ 
      title: "Error creating subject", 
      description: "There was an error creating the subject.",
      variant: "destructive" 
    });
    return null;
  }
};

export const updateSubjectService = async (updatedSubject: Subject): Promise<boolean> => {
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
    
    toast({ title: "Subject updated", description: `${updatedSubject.name} has been updated.` });
    return true;
  } catch (error) {
    console.error('Error updating subject:', error);
    toast({ 
      title: "Error updating subject", 
      description: "There was an error updating the subject.",
      variant: "destructive" 
    });
    return false;
  }
};

export const deleteSubjectService = async (id: string, subjectName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast({ 
      title: "Subject deleted", 
      description: `${subjectName} has been deleted.` 
    });
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    toast({ 
      title: "Error deleting subject", 
      description: "There was an error deleting the subject.",
      variant: "destructive" 
    });
    return false;
  }
};
