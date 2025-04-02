
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { PlusCircle } from 'lucide-react';

const Subjects = () => {
  const { subjects } = useData();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">Subjects</h1>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4" /> 
            Add Subject
          </Button>
        </div>

        <Card className="border-purple-200 shadow-md dark:border-purple-900/50">
          <CardHeader className="border-b border-purple-100 dark:border-purple-900/30">
            <CardTitle className="text-purple-800 dark:text-purple-200">All Subjects</CardTitle>
            <CardDescription>
              Manage your subjects that can be assigned to courses and exams.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {subjects.length > 0 ? (
              <Table>
                <TableHeader className="bg-purple-50 dark:bg-purple-900/20">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id} className="hover:bg-purple-50/70 dark:hover:bg-purple-900/10">
                      <TableCell className="font-medium text-purple-800 dark:text-purple-200">{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-purple-200 hover:border-purple-500 hover:bg-purple-50 dark:border-purple-900 dark:hover:bg-purple-900/50">Edit</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-2">No subjects found</p>
                <p className="text-muted-foreground">Create your first subject to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

import { BookOpen } from 'lucide-react';

export default Subjects;
