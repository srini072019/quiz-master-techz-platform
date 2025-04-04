
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider as DataProviderRefactored } from './contexts/DataContextRefactored';
import { Toaster } from './components/ui/toaster';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import Questions from './pages/Questions';
import Exams from './pages/Exams';
import Subjects from './pages/Subjects';
import Candidates from './pages/Candidates';

function App() {
  return (
    <AuthProvider>
      <DataProviderRefactored>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DataProviderRefactored>
    </AuthProvider>
  );
}

export default App;
