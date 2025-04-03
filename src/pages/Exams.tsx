
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Eye,
  FileText,
  History,
  LogOut,
  Pencil,
  Printer,
  Settings,
  Trash
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { toast } from '../hooks/use-toast';

const Exams = () => {
  const { exams, deleteExam } = useData();
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const handleDelete = (id: string, examName: string) => {
    if (window.confirm(`Are you sure you want to delete exam "${examName}"?`)) {
      deleteExam(id);
      toast({
        title: "Exam deleted",
        description: `${examName} has been successfully deleted.`
      });
    }
  };

  const handleEndExam = (examName: string) => {
    // This would actually end the exam in a real app
    toast({
      title: "Exam ended",
      description: `${examName} has been ended successfully.`
    });
  };

  // Calculate the exams to display based on pagination
  const indexOfLastExam = currentPage * pageSize;
  const indexOfFirstExam = indexOfLastExam - pageSize;
  const currentExams = exams.slice(indexOfFirstExam, indexOfLastExam);
  const totalPages = Math.ceil(exams.length / pageSize);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <div className="flex items-center space-x-2">
            <select
              className="border rounded p-2"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing page size
              }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableCaption>List of available exams</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Exam ID</TableHead>
                <TableHead>Exam Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentExams.map((exam) => {
                // Calculate the total questions across all subjects
                const totalQuestions = exam.subjects.reduce(
                  (total, subject) => total + subject.questionCount, 
                  0
                );
                
                return (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.id.substring(0, 8)}</TableCell>
                    <TableCell>{exam.name}</TableCell>
                    <TableCell>{exam.durationMinutes} minutes</TableCell>
                    <TableCell>{totalQuestions}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Settings className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-900" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white">
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>Exam Preview</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Exam Summary</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                            <History className="h-4 w-4" />
                            <span>Exam History</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="cursor-pointer flex items-center gap-2 text-amber-600"
                            onClick={() => handleEndExam(exam.name)}
                          >
                            <LogOut className="h-4 w-4" />
                            <span>End Exam</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer flex items-center gap-2 text-red-600"
                            onClick={() => handleDelete(exam.id, exam.name)}
                          >
                            <Trash className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                            <Printer className="h-4 w-4" />
                            <span>Print Exam</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {currentExams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No exams found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Exams;
