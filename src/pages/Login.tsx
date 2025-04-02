
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-200 to-purple-50 dark:from-purple-900 dark:to-slate-900">
      {/* Left Side - Technical Skills Visualization */}
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-600/10 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-md text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-6">
            TechZ MCQ Platform
          </h1>
          
          {/* Tech Images Grid - These are placeholders for AI-generated images */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Web Development Image */}
            <div className="bg-white/80 dark:bg-purple-900/50 p-4 rounded-lg shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform">
              <div className="h-40 w-full overflow-hidden rounded-md">
                <img 
                  src="/placeholder-web-dev.png" 
                  alt="Web Development" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Programming Image */}
            <div className="bg-white/80 dark:bg-purple-900/50 p-4 rounded-lg shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform">
              <div className="h-40 w-full overflow-hidden rounded-md">
                <img 
                  src="/placeholder-programming.png" 
                  alt="Programming" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Database Image */}
            <div className="bg-white/80 dark:bg-purple-900/50 p-4 rounded-lg shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform">
              <div className="h-40 w-full overflow-hidden rounded-md">
                <img 
                  src="/placeholder-database.png" 
                  alt="Database" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* DevOps Image */}
            <div className="bg-white/80 dark:bg-purple-900/50 p-4 rounded-lg shadow-lg backdrop-blur-sm transform hover:scale-105 transition-transform">
              <div className="h-40 w-full overflow-hidden rounded-md">
                <img 
                  src="/placeholder-devops.png" 
                  alt="DevOps" 
                  className="h-full w-full object-cover"
                />
              </div>
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
