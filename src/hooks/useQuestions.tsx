
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MCQQuestion, DifficultyLevel } from '../types';
import { QuestionsContextType } from '../contexts/types';
import { 
  fetchQuestions, 
  addQuestionService,
  updateQuestionService,
  deleteQuestionService,
  getQuestionsForExamService
} from '../services/QuestionsService';

export function useQuestions(): QuestionsContextType {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      loadQuestions();
    }
  }, [currentUser]);
  
  const loadQuestions = async () => {
    const data = await fetchQuestions();
    setQuestions(data);
  };
  
  const addQuestion = async (question: Omit<MCQQuestion, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    const newQuestion = await addQuestionService(question, currentUser.id);
    if (newQuestion) {
      setQuestions(prev => [...prev, newQuestion]);
    }
  };
  
  const updateQuestion = async (question: MCQQuestion) => {
    if (!currentUser) return;
    
    const success = await updateQuestionService(question);
    if (success) {
      // For questions, we reload them to get the updated option IDs
      await loadQuestions();
    }
  };
  
  const deleteQuestion = async (id: string) => {
    if (!currentUser) return;
    
    const questionToDelete = questions.find(q => q.id === id);
    if (!questionToDelete) return;
    
    const success = await deleteQuestionService(id);
    if (success) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };
  
  const getQuestionById = (id: string) => {
    return questions.find(question => question.id === id);
  };
  
  const getQuestionsForSubject = (subjectId: string) => {
    return questions.filter(question => question.subjectId === subjectId);
  };

  const getQuestionsForExam = async (examId: string) => {
    return getQuestionsForExamService(examId, questions);
  };
  
  return {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
    getQuestionsForSubject,
    getQuestionsForExam
  };
}
