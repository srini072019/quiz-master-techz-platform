
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { toast } from '../hooks/use-toast';

// Mock user data for development
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@techz.com',
    name: 'Admin User',
    role: 'admin' as UserRole,
    password: 'admin123',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'instructor@techz.com',
    name: 'Instructor User',
    role: 'instructor' as UserRole,
    password: 'instructor123',
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'participant@techz.com',
    name: 'Participant User',
    role: 'participant' as UserRole,
    password: 'participant123',
    createdAt: new Date(),
  },
];

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for saved user data
    const savedUser = localStorage.getItem('techz_user');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt)
        });
      } catch (error) {
        console.error("Failed to parse saved user data:", error);
        localStorage.removeItem('techz_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call with mock data
      const user = MOCK_USERS.find(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.password === password
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Remove password for security
      const { password: _, ...userWithoutPassword } = user;
      
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('techz_user', JSON.stringify(userWithoutPassword));
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Check if email already exists
      if (MOCK_USERS.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already in use');
      }

      // In a real app, this would make an API call
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 11),
        email,
        name,
        role: 'participant', // Default role for new users
        createdAt: new Date(),
      };

      // In a real app, we would save this to a database
      // For now, we'll just set the current user
      setCurrentUser(newUser);
      localStorage.setItem('techz_user', JSON.stringify(newUser));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('techz_user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
