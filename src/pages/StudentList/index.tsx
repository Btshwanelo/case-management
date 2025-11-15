import React, { useEffect, useState } from 'react';
import { useEmployeeRetrieveInstiStudentsMutation, useExportStudentsMutation } from '@/services/apiService';
import { Search, Filter, UserCheck, Users, User, UserX, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import DashboardLayout from '@/layouts/DashboardLayout';
import Breadcrumb from '@/components/BreadCrumb';
import InsightCard from '@/components/InsightCard';
import EmptyState from '@/components/EmptyState';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';
import PageLoder from '@/components/PageLoder';
import ErrorPage from '@/components/ErrorPage';
import { useNavigate } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { X } from 'lucide-react';
import EnhancedPagination from '@/components/EnhancedPagination';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';

const StudentList = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSearch, setIsSearch] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(12);
  const [filters, setFilters] = useState([]);

  const [loaderType, setLoaderType] = useState('');

  const navigate = useNavigate();
  const [employeeRetrieveInstiStudents, { data, isLoading, isSuccess, isError, error }] = useEmployeeRetrieveInstiStudentsMutation();
  const [exportStudents, { isLoading: isLoadingExport, isSuccess: isSuccessExport, isError: isErrorExport, data: dataExport }] =
    useExportStudentsMutation();

  useEffect(() => {
    employeeRetrieveInstiStudents({
      body: {
        entityName: 'Employee',
        requestName: 'RetrieveInstiStudents',
        inputParamters: {
          SupplierId: userDetails.supplierId,
          SearchText: searchText,
          PageNumber: pageNumber,
          PageSize: pageSize,
          Filters: filters,
          Status: statusFilter,
        },
      },
    });
  }, [isSearch, pageNumber, statusFilter]);

  const downloadFile = async (data: { name: string; extension: string; content: unknown }) => {
    const a = document.createElement('a');
    a.download = data.name + '.' + data.extension;
    a.href = `data:text/${data.extension};base64,${data.content}`;
    a.click();
  };

  useEffect(() => {
    if (isSuccessExport) {
      downloadFile({ name: dataExport?.file[0]?.name, extension: 'xlsx', content: dataExport?.file[0]?.content });
    }
  }, [isSuccessExport]);

  const stats = data?.Summary || {
    totalStudents: 0,
    unverified: 0,
    pendingVerification: 0,
    verified: 0,
  };

  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  const handleExport = () => {
    exportStudents({
      body: { requestName: 'ExportAllocationsReq', inputParamters: { supplierId: userDetails.supplierId } },
    });
  };

  const summaryData = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      subtitle: '',
      icon: <Users className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-200',
    },
    {
      title: 'Trimester',
      value: stats.trimester,
      subtitle: '',
      icon: <UserCheck className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-200',
    },
    {
      title: 'Semster',
      value: stats.semester,
      subtitle: '',
      icon: <Users className="h-5 w-5 text-purple-500" />,
      bgColor: 'bg-purple-200',
    },
    {
      title: 'Annual',
      value: stats.annual,
      subtitle: '',
      icon: <User className="h-5 w-5 text-yellow-500" />,
      bgColor: 'bg-yellow-200',
    },
  ];

  const breadcrumbItems = [{ path: '/students', label: 'Students' }];
  const totalRecords = data?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isError && <ErrorPage message={error.data} />}
      {isLoading && <PageLoder />}

      {isSuccess && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryData.map((item, index) => (
              <InsightCard
                key={index}
                icon={item.icon}
                title={item.title}
                value={item.value}
                subtitle={item.subtitle}
                iconBgColor={item.bgColor}
              />
            ))}
          </div>

          {isSearch && (
            <div className="bg-blue-100 px-6 py-2 rounded-lg text-blue-600 font-semibold flex justify-between">
              <div>
                <span className="text-black">Showing search results for </span> {searchText}
              </div>
              <X
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  setSearchText('');
                  setIsSearch(!isSearch);
                }}
              />
            </div>
          )}

          {/* Students List */}
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="text-xl flex justify-between">
                <div>All Students</div>
                <div className="flex gap-2">
                  <Button variant="default" type="button" onClick={handleExport}>
                    <Download /> Export
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>View and manage student records</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2 w-1/3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search students..."
                      className="pl-10"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsSearch(!isSearch)}>
                    <Search className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                    <SelectItem value="Semester">Semester</SelectItem>
                    <SelectItem value="Trimester">Trimester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Process Cycle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.Listing?.map((student) => (
                    <TableRow key={student.employeeId}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{student.studentName}</TableCell>
                      <TableCell>{student.idNumber}</TableCell>
                      <TableCell>{student.campusIdName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.mobile}</TableCell>
                      <TableCell>{student.processCycle}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="default"
                          className="border border-orange-500 text-orange-500 hover:text-orange-500"
                          onClick={() => navigate(`/ap/students/${student.employeeId}?number=${student.mobile}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {/* {data?.Listing?.length > 0 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setPageNumber((p) => Math.max(1, p - 1))} disabled={pageNumber === 1} />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink onClick={() => setPageNumber(i + 1)} isActive={pageNumber === i + 1}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                          disabled={pageNumber === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )} */}

              {data?.Listing.length > 0 && (
                <div className="mt-4">
                  <EnhancedPagination
                    currentPage={pageNumber}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setLoaderType('pagination');
                      setPageNumber(page);
                    }}
                  />
                </div>
              )}

              {isSuccess && data.Listing.length < 1 && (
                <EmptyState title="No students found" description="No student records found" icon={EmptyStateIcon} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentList;
