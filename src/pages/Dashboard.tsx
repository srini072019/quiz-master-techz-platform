
import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  BookOpen, 
  FileQuestion, 
  GraduationCap, 
  PenTool, 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: number | string; 
  description?: string;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { 
    subjects, 
    questions, 
    courses, 
    exams, 
    examAttempts, 
    getExamAttemptsForUser
  } = useData();

  // For admin and instructors
  const totalSubjects = subjects.length;
  const totalQuestions = questions.length;
  const totalCourses = courses.length;
  const totalExams = exams.length;
  
  // For participants
  const userExamAttempts = currentUser ? getExamAttemptsForUser(currentUser.id) : [];
  const passedExams = userExamAttempts.filter(attempt => attempt.passed).length;
  const failedExams = userExamAttempts.filter(attempt => attempt.endTime && !attempt.passed).length;
  const upcomingExams = exams.filter(exam => 
    new Date(exam.scheduledDate) > new Date() && 
    exam.participants.includes(currentUser?.id || '')
  ).length;
  
  const userCourses = courses.filter(course => 
    course.participants.includes(currentUser?.id || '')
  ).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name}!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Admin & Instructor Stats */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'instructor') && (
            <>
              <StatCard
                title="Total Subjects"
                value={totalSubjects}
                icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Total Questions"
                value={totalQuestions}
                icon={<FileQuestion className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Total Courses"
                value={totalCourses}
                icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Total Exams"
                value={totalExams}
                icon={<PenTool className="h-4 w-4 text-muted-foreground" />}
              />
              {currentUser?.role === 'admin' && (
                <StatCard
                  title="Total Users" 
                  value="3" // Mock data for now
                  icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
              )}
            </>
          )}

          {/* Participant Stats */}
          {currentUser?.role === 'participant' && (
            <>
              <StatCard
                title="My Courses"
                value={userCourses}
                icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Upcoming Exams"
                value={upcomingExams}
                icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Passed Exams"
                value={passedExams}
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              />
              <StatCard
                title="Failed Exams"
                value={failedExams}
                icon={<XCircle className="h-4 w-4 text-rose-500" />}
              />
            </>
          )}
        </div>

        {/* Recent Activity - Placeholder for now */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of your recent activity</CardDescription>
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
