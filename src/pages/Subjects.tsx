
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
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> 
            Add Subject
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subjects</CardTitle>
            <CardDescription>
              Manage your subjects that can be assigned to courses and exams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No subjects found. Create your first subject to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Subjects;
