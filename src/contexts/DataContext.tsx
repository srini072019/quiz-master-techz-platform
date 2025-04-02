
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

// Initial mock data
const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 's1',
    name: 'Introduction to Programming',
    code: 'CS101',
    description: 'Basic programming concepts and algorithms',
    createdById: '1',
    createdAt: new Date()
  },
  {
    id: 's2',
    name: 'Web Development',
    code: 'CS201',
    description: 'HTML, CSS, and JavaScript fundamentals',
    createdById: '1',
    createdAt: new Date()
  },
  {
    id: 's3',
    name: 'Database Systems',
    code: 'CS301',
    description: 'Database design and SQL',
    createdById: '2',
    createdAt: new Date()
  }
];

const INITIAL_QUESTIONS: MCQQuestion[] = [
  {
    id: 'q1',
    text: 'Which of the following is not a programming language?',
    options: [
      { id: 'o1', text: 'Python', isCorrect: false },
      { id: 'o2', text: 'Java', isCorrect: false },
      { id: 'o3', text: 'HTML', isCorrect: true },
      { id: 'o4', text: 'C++', isCorrect: false }
    ],
    difficulty: 'easy',
    subjectId: 's1',
    createdById: '1',
    createdAt: new Date()
  },
  {
    id: 'q2',
    text: 'Which HTML tag is used to create a hyperlink?',
    options: [
      { id: 'o5', text: '<link>', isCorrect: false },
      { id: 'o6', text: '<a>', isCorrect: true },
      { id: 'o7', text: '<href>', isCorrect: false },
      { id: 'o8', text: '<url>', isCorrect: false }
    ],
    difficulty: 'easy',
    subjectId: 's2',
    createdById: '1',
    createdAt: new Date()
  },
  {
    id: 'q3',
    text: 'Which SQL command is used to insert data into a database table?',
    options: [
      { id: 'o9', text: 'ADD', isCorrect: false },
      { id: 'o10', text: 'INSERT', isCorrect: true },
      { id: 'o11', text: 'UPDATE', isCorrect: false },
      { id: 'o12', text: 'PUSH', isCorrect: false }
    ],
    difficulty: 'medium',
    subjectId: 's3',
    createdById: '2',
    createdAt: new Date()
  }
];

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    name: 'Computer Science Fundamentals',
    code: 'CS1000',
    description: 'Introduction to computer science concepts',
    subjects: ['s1', 's2'],
    participants: ['3'],
    createdById: '1',
    createdAt: new Date()
  },
  {
    id: 'c2',
    name: 'Web & Database Technologies',
    code: 'CS2000',
    description: 'Web programming and database management',
    subjects: ['s2', 's3'],
    participants: ['3'],
    createdById: '2',
    createdAt: new Date()
  }
];

const INITIAL_EXAMS: Exam[] = [
  {
    id: 'e1',
    name: 'CS1000 Midterm',
    description: 'Midterm exam for Computer Science Fundamentals',
    courseId: 'c1',
    subjects: [
      { subjectId: 's1', questionCount: 5, difficulty: 'mixed' },
      { subjectId: 's2', questionCount: 5, difficulty: 'easy' }
    ],
    durationMinutes: 30,
    passingPercentage: 60,
    participants: ['3'],
    scheduledDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdById: '1',
    createdAt: new Date()
  }
];

const INITIAL_EXAM_ATTEMPTS: ExamAttempt[] = [];

interface DataContextType {
  subjects: Subject[];
  questions: MCQQuestion[];
  courses: Course[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'createdById'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  addQuestion: (question: Omit<MCQQuestion, 'id' | 'createdAt' | 'createdById'>) => void;
  updateQuestion: (question: MCQQuestion) => void;
  deleteQuestion: (id: string) => void;
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'createdById'>) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  addExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'createdById'>) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  startExamAttempt: (examId: string) => string;
  submitExamAttempt: (attemptId: string, answers: { questionId: string, selectedOptionId: string }[]) => void;
  getSubjectById: (id: string) => Subject | undefined;
  getQuestionById: (id: string) => MCQQuestion | undefined;
  getCourseById: (id: string) => Course | undefined;
  getExamById: (id: string) => Exam | undefined;
  getExamAttemptsForUser: (userId: string) => ExamAttempt[];
  getExamAttemptsForExam: (examId: string) => ExamAttempt[];
  getQuestionsForSubject: (subjectId: string) => MCQQuestion[];
  getExamsForCourse: (courseId: string) => Exam[];
  getQuestionsForExam: (examId: string) => MCQQuestion[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);

  useEffect(() => {
    // Load initial data or from localStorage if available
    const loadedSubjects = localStorage.getItem('techz_subjects');
    const loadedQuestions = localStorage.getItem('techz_questions');
    const loadedCourses = localStorage.getItem('techz_courses');
    const loadedExams = localStorage.getItem('techz_exams');
    const loadedAttempts = localStorage.getItem('techz_exam_attempts');

    setSubjects(loadedSubjects ? JSON.parse(loadedSubjects) : INITIAL_SUBJECTS);
    setQuestions(loadedQuestions ? JSON.parse(loadedQuestions) : INITIAL_QUESTIONS);
    setCourses(loadedCourses ? JSON.parse(loadedCourses) : INITIAL_COURSES);
    setExams(loadedExams ? JSON.parse(loadedExams) : INITIAL_EXAMS);
    setExamAttempts(loadedAttempts ? JSON.parse(loadedAttempts) : INITIAL_EXAM_ATTEMPTS);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('techz_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('techz_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('techz_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('techz_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('techz_exam_attempts', JSON.stringify(examAttempts));
  }, [examAttempts]);

  // Subject functions
  const addSubject = (subject: Omit<Subject, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    const newSubject: Subject = {
      ...subject,
      id: Math.random().toString(36).substring(2, 11),
      createdById: currentUser.id,
      createdAt: new Date()
    };
    
    setSubjects([...subjects, newSubject]);
    toast({ title: "Subject created", description: `${subject.name} has been created successfully.` });
  };

  const updateSubject = (updatedSubject: Subject) => {
    if (!currentUser) return;
    
    setSubjects(subjects.map(subject => 
      subject.id === updatedSubject.id ? updatedSubject : subject
    ));
    toast({ title: "Subject updated", description: `${updatedSubject.name} has been updated.` });
  };

  const deleteSubject = (id: string) => {
    if (!currentUser) return;
    
    const subjectToDelete = subjects.find(s => s.id === id);
    if (!subjectToDelete) return;
    
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
    
    // Remove all questions related to this subject
    setQuestions(questions.filter(q => q.subjectId !== id));
    
    // Remove the subject
    setSubjects(subjects.filter(subject => subject.id !== id));
    toast({ 
      title: "Subject deleted", 
      description: `${subjectToDelete.name} has been deleted.` 
    });
  };

  // Question functions
  const addQuestion = (question: Omit<MCQQuestion, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    const newQuestion: MCQQuestion = {
      ...question,
      id: Math.random().toString(36).substring(2, 11),
      createdById: currentUser.id,
      createdAt: new Date()
    };
    
    setQuestions([...questions, newQuestion]);
    toast({ title: "Question created", description: "New question has been added." });
  };

  const updateQuestion = (updatedQuestion: MCQQuestion) => {
    if (!currentUser) return;
    
    setQuestions(questions.map(question => 
      question.id === updatedQuestion.id ? updatedQuestion : question
    ));
    toast({ title: "Question updated", description: "Question has been updated." });
  };

  const deleteQuestion = (id: string) => {
    if (!currentUser) return;
    
    setQuestions(questions.filter(question => question.id !== id));
    toast({ title: "Question deleted", description: "Question has been deleted." });
  };

  // Course functions
  const addCourse = (course: Omit<Course, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    const newCourse: Course = {
      ...course,
      id: Math.random().toString(36).substring(2, 11),
      createdById: currentUser.id,
      createdAt: new Date()
    };
    
    setCourses([...courses, newCourse]);
    toast({ title: "Course created", description: `${course.name} has been created.` });
  };

  const updateCourse = (updatedCourse: Course) => {
    if (!currentUser) return;
    
    setCourses(courses.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    ));
    toast({ title: "Course updated", description: `${updatedCourse.name} has been updated.` });
  };

  const deleteCourse = (id: string) => {
    if (!currentUser) return;
    
    const courseToDelete = courses.find(c => c.id === id);
    if (!courseToDelete) return;
    
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
    
    setCourses(courses.filter(course => course.id !== id));
    toast({ 
      title: "Course deleted", 
      description: `${courseToDelete.name} has been deleted.` 
    });
  };

  // Exam functions
  const addExam = (exam: Omit<Exam, 'id' | 'createdAt' | 'createdById'>) => {
    if (!currentUser) return;
    
    const newExam: Exam = {
      ...exam,
      id: Math.random().toString(36).substring(2, 11),
      createdById: currentUser.id,
      createdAt: new Date()
    };
    
    setExams([...exams, newExam]);
    toast({ title: "Exam created", description: `${exam.name} has been created.` });
  };

  const updateExam = (updatedExam: Exam) => {
    if (!currentUser) return;
    
    setExams(exams.map(exam => 
      exam.id === updatedExam.id ? updatedExam : exam
    ));
    toast({ title: "Exam updated", description: `${updatedExam.name} has been updated.` });
  };

  const deleteExam = (id: string) => {
    if (!currentUser) return;
    
    const examToDelete = exams.find(e => e.id === id);
    if (!examToDelete) return;
    
    // Delete all exam attempts for this exam
    setExamAttempts(examAttempts.filter(attempt => attempt.examId !== id));
    
    // Delete the exam
    setExams(exams.filter(exam => exam.id !== id));
    toast({ 
      title: "Exam deleted", 
      description: `${examToDelete.name} has been deleted.` 
    });
  };

  // Exam attempt functions
  const startExamAttempt = (examId: string): string => {
    if (!currentUser) throw new Error("User not authenticated");
    
    const exam = exams.find(e => e.id === examId);
    if (!exam) throw new Error("Exam not found");
    
    // Check if user is allowed to take this exam
    if (!exam.participants.includes(currentUser.id)) {
      throw new Error("You are not assigned to this exam");
    }
    
    // Check if user already has an ongoing attempt
    const ongoingAttempt = examAttempts.find(
      a => a.examId === examId && 
      a.userId === currentUser.id && 
      !a.endTime
    );
    
    if (ongoingAttempt) {
      return ongoingAttempt.id;
    }
    
    // Create new attempt
    const newAttempt: ExamAttempt = {
      id: Math.random().toString(36).substring(2, 11),
      examId,
      userId: currentUser.id,
      startTime: new Date(),
      answers: []
    };
    
    setExamAttempts([...examAttempts, newAttempt]);
    toast({ title: "Exam started", description: `${exam.name} has begun.` });
    
    return newAttempt.id;
  };

  const submitExamAttempt = (
    attemptId: string, 
    answers: { questionId: string, selectedOptionId: string }[]
  ) => {
    if (!currentUser) return;
    
    const attemptIndex = examAttempts.findIndex(a => a.id === attemptId);
    if (attemptIndex === -1) return;
    
    const attempt = examAttempts[attemptIndex];
    const exam = exams.find(e => e.id === attempt.examId);
    if (!exam) return;
    
    // Calculate score
    let correctAnswers = 0;
    const examQuestions = getQuestionsForExam(exam.id);
    
    answers.forEach(answer => {
      const question = examQuestions.find(q => q.id === answer.questionId);
      if (question) {
        const isCorrect = question.options.find(
          o => o.id === answer.selectedOptionId && o.isCorrect
        );
        if (isCorrect) correctAnswers++;
      }
    });
    
    const totalQuestions = examQuestions.length;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passed = score >= exam.passingPercentage;
    
    // Update the attempt
    const updatedAttempt: ExamAttempt = {
      ...attempt,
      endTime: new Date(),
      answers,
      score,
      passed
    };
    
    const newAttempts = [...examAttempts];
    newAttempts[attemptIndex] = updatedAttempt;
    
    setExamAttempts(newAttempts);
    toast({ 
      title: "Exam submitted", 
      description: `Your score: ${score.toFixed(2)}%${passed ? ' (Passed)' : ' (Failed)'}`
    });
  };

  // Getters
  const getSubjectById = (id: string) => subjects.find(subject => subject.id === id);
  
  const getQuestionById = (id: string) => questions.find(question => question.id === id);
  
  const getCourseById = (id: string) => courses.find(course => course.id === id);
  
  const getExamById = (id: string) => exams.find(exam => exam.id === id);
  
  const getExamAttemptsForUser = (userId: string) => 
    examAttempts.filter(attempt => attempt.userId === userId);
  
  const getExamAttemptsForExam = (examId: string) => 
    examAttempts.filter(attempt => attempt.examId === examId);
  
  const getQuestionsForSubject = (subjectId: string) => 
    questions.filter(question => question.subjectId === subjectId);
  
  const getExamsForCourse = (courseId: string) => 
    exams.filter(exam => exam.courseId === courseId);

  const getQuestionsForExam = (examId: string): MCQQuestion[] => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return [];
    
    const result: MCQQuestion[] = [];
    
    exam.subjects.forEach(examSubject => {
      const subjectQuestions = questions.filter(q => q.subjectId === examSubject.subjectId);
      
      // Filter by difficulty if specified
      const filteredQuestions = examSubject.difficulty === 'mixed' 
        ? subjectQuestions
        : subjectQuestions.filter(q => q.difficulty === examSubject.difficulty);
      
      // Get random questions up to questionCount
      let selectedQuestions = [...filteredQuestions];
      if (selectedQuestions.length > examSubject.questionCount) {
        selectedQuestions = selectedQuestions
          .sort(() => 0.5 - Math.random())
          .slice(0, examSubject.questionCount);
      }
      
      result.push(...selectedQuestions);
    });
    
    return result;
  };

  return (
    <DataContext.Provider value={{
      subjects,
      questions,
      courses,
      exams,
      examAttempts,
      addSubject,
      updateSubject,
      deleteSubject,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addCourse,
      updateCourse,
      deleteCourse,
      addExam,
      updateExam,
      deleteExam,
      startExamAttempt,
      submitExamAttempt,
      getSubjectById,
      getQuestionById,
      getCourseById,
      getExamById,
      getExamAttemptsForUser,
      getExamAttemptsForExam,
      getQuestionsForSubject,
      getExamsForCourse,
      getQuestionsForExam
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
}
