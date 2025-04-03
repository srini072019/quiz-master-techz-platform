
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronDown, 
  Eye, 
  BarChart, 
  Edit, 
  Trash2, 
  Settings, 
  Ban
} from 'lucide-react';

// Mock data for candidates
const mockCandidates = [
  { 
    id: 'CAN001', 
    name: 'John Smith', 
    courseGroup: 'Web Development', 
    username: 'johnsmith',
    examsTaken: 5
  },
  { 
    id: 'CAN002', 
    name: 'Emma Johnson', 
    courseGroup: 'Data Science', 
    username: 'emmaj',
    examsTaken: 3
  },
  { 
    id: 'CAN003', 
    name: 'Michael Brown', 
    courseGroup: 'Cybersecurity', 
    username: 'mikebrown',
    examsTaken: 7
  },
  { 
    id: 'CAN004', 
    name: 'Sarah Williams', 
    courseGroup: 'UI/UX Design', 
    username: 'sarahw',
    examsTaken: 2
  },
  { 
    id: 'CAN005', 
    name: 'David Miller', 
    courseGroup: 'Mobile Development', 
    username: 'davem',
    examsTaken: 4
  },
  { 
    id: 'CAN006', 
    name: 'Jennifer Jones', 
    courseGroup: 'Cloud Computing', 
    username: 'jenjones',
    examsTaken: 6
  },
  // Additional mock data to have more than 25 entries
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `CAN0${(i + 7).toString().padStart(2, '0')}`,
    name: `Candidate ${i + 7}`,
    courseGroup: ['Web Development', 'Data Science', 'Cybersecurity', 'UI/UX Design'][i % 4],
    username: `user${i + 7}`,
    examsTaken: Math.floor(Math.random() * 10) + 1
  }))
];

const Candidates = () => {
  const [perPage, setPerPage] = useState<string>("25");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const itemsPerPage = parseInt(perPage);
  const totalPages = Math.ceil(mockCandidates.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentCandidates = mockCandidates.slice(startIdx, endIdx);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={perPage}
              onValueChange={(value) => {
                setPerPage(value);
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Course Group</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">{candidate.id}</TableCell>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.courseGroup}</TableCell>
                  <TableCell>{candidate.username}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-md hover:bg-muted">
                          <Settings className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                          <Eye className="h-4 w-4" />
                          <span>View Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="h-4 w-4" />
                            <span>Exam History</span>
                            <span className="ml-auto bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 text-xs py-0.5 px-1.5 rounded-full">
                              {candidate.examsTaken}
                            </span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                          <BarChart className="h-4 w-4" />
                          <span>Performance History</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-amber-600 hover:text-amber-700">
                          <Ban className="h-4 w-4" />
                          <span>Inactivate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }} 
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage + i - 2;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              if (pageNum <= 0 || pageNum > totalPages) return null;
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === pageNum}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNum);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Layout>
  );
};

export default Candidates;
