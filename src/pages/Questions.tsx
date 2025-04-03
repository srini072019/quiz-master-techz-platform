
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Eye, Copy, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const Questions = () => {
  const { questions, subjects, getSubjectById } = useData();
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter questions based on search term
  const filteredQuestions = questions.filter(question => 
    question.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getSubjectById(question.subjectId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastQuestion = currentPage * pageSize;
  const indexOfFirstQuestion = indexOfLastQuestion - pageSize;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / pageSize);

  const handlePreview = (questionId: string) => {
    // Implement preview functionality
    toast({
      title: "Preview",
      description: "Question preview functionality will be implemented here."
    });
  };

  const handleDuplicate = (questionId: string) => {
    // Implement duplicate functionality
    toast({
      title: "Duplicate",
      description: "Question duplication functionality will be implemented here."
    });
  };

  const handleEdit = (questionId: string) => {
    // Implement edit functionality
    toast({
      title: "Edit",
      description: "Question editing functionality will be implemented here."
    });
  };

  const handleDelete = (questionId: string) => {
    // Implement delete functionality
    toast({
      title: "Delete",
      description: "Question deletion functionality will be implemented here."
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
            <p className="text-muted-foreground">
              Manage your exam questions
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Add New Question
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead className="w-48">Subject</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentQuestions.length > 0 ? (
                currentQuestions.map((question) => {
                  const subject = getSubjectById(question.subjectId);
                  return (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{question.id}</TableCell>
                      <TableCell>{subject?.name || "Unknown Subject"}</TableCell>
                      <TableCell>
                        <div className="truncate max-w-md" title={question.text}>
                          {question.text}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(question.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Preview</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(question.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              <span>Duplicate</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(question.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(question.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No questions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstQuestion + 1} to {Math.min(indexOfLastQuestion, filteredQuestions.length)} of {filteredQuestions.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              size="sm"
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Questions;
