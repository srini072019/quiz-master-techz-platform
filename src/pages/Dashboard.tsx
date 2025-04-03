
import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  BookOpen, 
  FileQuestion, 
  GraduationCap, 
  PenTool, 
  Users
} from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  linkTo,
  color = "text-purple-600"
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode;
  linkTo: string;
  color?: string;
}) => (
  <Link to={linkTo}>
    <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-purple-400">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full bg-purple-100 dark:bg-purple-900/50 ${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  </Link>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { 
    subjects, 
    questions, 
    courses, 
    exams 
  } = useData();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name}!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Main Stats for everyone */}
          <StatCard
            title="Exams"
            value={exams.length}
            icon={<PenTool className="h-5 w-5" />}
            linkTo="/exams"
            color="text-blue-600"
          />
          
          <StatCard
            title="Candidates"
            value="3" // Mock data for now
            icon={<Users className="h-5 w-5" />}
            linkTo="/candidates"
            color="text-emerald-600"
          />
          
          <StatCard
            title="Questions"
            value={questions.length}
            icon={<FileQuestion className="h-5 w-5" />}
            linkTo="/questions"
            color="text-amber-600"
          />
          
          <StatCard
            title="Courses"
            value={courses.length}
            icon={<GraduationCap className="h-5 w-5" />}
            linkTo="/courses"
            color="text-rose-600"
          />
          
          <StatCard
            title="Subjects"
            value={subjects.length}
            icon={<BookOpen className="h-5 w-5" />}
            linkTo="/subjects"
            color="text-indigo-600"
          />
        </div>

        {/* Additional dashboard content based on role */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {currentUser?.role === 'participant' 
                ? "Your exam results and upcoming sessions will appear here." 
                : "Recent updates to courses, exams, and participant progress will appear here."}
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
