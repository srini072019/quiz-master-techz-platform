
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Laptop, Code, Database, Server, LucideProps } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const TechIcon = ({ icon: Icon, className }: { icon: React.FC<LucideProps>; className?: string }) => (
    <div className={`flex items-center justify-center rounded-full p-3 ${className}`}>
      <Icon className="h-6 w-6" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-200 to-purple-50 dark:from-purple-900 dark:to-slate-900">
      {/* Left Side - Technical Skills Visualization */}
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-600/10 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-md text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-6">
            TechZ MCQ Platform
          </h1>
          <p className="text-purple-800 dark:text-purple-200 mb-8 text-lg">
            The modern way to conduct technical assessments and exams
          </p>
          
          {/* Tech Icons Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white/80 dark:bg-purple-900/50 p-6 rounded-lg shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform">
              <TechIcon icon={Laptop} className="bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-300 mb-3" />
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">Web Development</h3>
              <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">HTML, CSS, JavaScript and modern frameworks</p>
            </div>
            <div className="bg-white/80 dark:bg-purple-900/50 p-6 rounded-lg shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform">
              <TechIcon icon={Code} className="bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-300 mb-3" />
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">Programming</h3>
              <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">Python, Java, C++, and more languages</p>
            </div>
            <div className="bg-white/80 dark:bg-purple-900/50 p-6 rounded-lg shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform">
              <TechIcon icon={Database} className="bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-300 mb-3" />
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">Database</h3>
              <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">SQL, NoSQL, and data modeling concepts</p>
            </div>
            <div className="bg-white/80 dark:bg-purple-900/50 p-6 rounded-lg shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform">
              <TechIcon icon={Server} className="bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-300 mb-3" />
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">DevOps</h3>
              <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">CI/CD, Docker, Kubernetes and cloud platforms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 md:hidden">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">TechZ</h1>
            <p className="text-muted-foreground mt-1">MCQ Exam Platform</p>
          </div>
          
          <Card className="border-purple-200 shadow-xl dark:border-purple-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-800 dark:text-purple-200">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-purple-200 focus:border-purple-500 dark:border-purple-900"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-purple-200 focus:border-purple-500 dark:border-purple-900"
                  />
                </div>

                <div className="text-sm text-muted-foreground bg-purple-50/50 dark:bg-purple-900/20 p-3 rounded-md">
                  <p>Demo credentials:</p>
                  <p>Admin: admin@techz.com / admin123</p>
                  <p>Instructor: instructor@techz.com / instructor123</p>
                  <p>Participant: participant@techz.com / participant123</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button 
                  type="submit" 
                  className="w-full mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:underline">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
