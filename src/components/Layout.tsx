
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, User, BookOpen, FileQuestion, GraduationCap, PenTool, Users, BarChart } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavItem = ({ to, icon, children }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-md transition-colors
       ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-purple-100 dark:hover:bg-purple-900/30'}
      `
    }
  >
    {icon}
    <span>{children}</span>
  </NavLink>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Redirect to login if not logged in
  React.useEffect(() => {
    if (!currentUser && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-purple-50/50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="bg-white dark:bg-slate-800 border-r border-purple-200 dark:border-purple-900/50 w-64 p-4 hidden md:block">
        <div className="flex items-center mb-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">TechZ</div>
        </div>

        <div className="space-y-1">
          <NavItem to="/dashboard" icon={<BarChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />}>
            Dashboard
          </NavItem>
          
          {(currentUser.role === 'admin' || currentUser.role === 'instructor') && (
            <>
              <NavItem to="/subjects" icon={<BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />}>
                Subjects
              </NavItem>
              
              <NavItem to="/questions" icon={<FileQuestion className="h-5 w-5 text-purple-600 dark:text-purple-400" />}>
                Questions
              </NavItem>
              
              <NavItem to="/courses" icon={<GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />}>
                Courses
              </NavItem>
              
              <NavItem to="/exams" icon={<PenTool className="h-5 w-5 text-purple-600 dark:text-purple-400" />}>
                Exams
              </NavItem>
              
              {currentUser.role === 'admin' && (
                <NavItem to="/candidates" icon={<Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />}>
                  Candidates
                </NavItem>
              )}
            </>
          )}
          
          {currentUser.role === 'participant' && (
            <>
              <NavItem to="/my-courses" icon={<GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />}>
                My Courses
              </NavItem>
              
              <NavItem to="/my-exams" icon={<PenTool className="h-5 w-5 text-purple-600 dark:text-purple-400" />}>
                My Exams
              </NavItem>
            </>
          )}
          
          <NavItem to="/profile" icon={<User className="h-5 w-5 text-purple-600 dark:text-purple-400" />}>
            Profile
          </NavItem>
        </div>

        <div className="absolute bottom-4 w-56">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 dark:border-purple-900 dark:hover:bg-purple-900/50" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="border-b border-purple-200 dark:border-purple-900/50 p-4 flex justify-between items-center md:hidden bg-white dark:bg-slate-800">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">TechZ</div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-purple-200 hover:border-purple-500 hover:bg-purple-50 dark:border-purple-900 dark:hover:bg-purple-900/50">
            <LogOut className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </Button>
        </header>
        
        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
