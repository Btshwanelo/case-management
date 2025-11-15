import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useSearchStudentMutation } from '@/services/apiService';
import { Search, SearchCheckIcon, SearchIcon, Users, X } from 'lucide-react';
import NoResultsCard from './NoResults';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import ErrorCard from './ErrorHandler';
import EmptyCard from './EmptyState';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeClass } from '@/utils';
import Breadcrumb from '@/components/BreadCrumb';
import EmptyState from '@/components/EmptyState';
import Illustration from './Illustration';
import InviteStudent from './InviteStudents';

const StudentSearch = () => {
  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const navigate = useNavigate();
  const [isInviteStudent, setIsInviteStudent] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchStudent, { isLoading, isSuccess, data: searchData, error, isError }] = useSearchStudentMutation();
  const [studentDetails, setStudentDetails] = useState({});
  const [isNsfas, setIsNsfas] = useState(false);

  const handleSearch = () => {
    searchStudent({
      body: {
        entityName: 'Employee',
        requestName: 'StudentSearch',
        inputParamters: {
          accomodationProviderId: userDetails.supplierId,
          SearchText: searchText,
          PageNumber: 1,
          PageSize: 20,
          Filters: [],
          APCode: '',
        },
      },
    });
  };

  const handleClearSearch = () => setSearchText('');

  useEffect(() => {
    if (searchData?.IsNasfas) {
      const studentDetails = searchData?.Listing[0];
      const isNsfas = searchData?.IsNasfas;
      setStudentDetails(studentDetails);
      setIsNsfas(isNsfas);
      return;
    }
  }, [searchData]);

  const handleSendSearchParams = (data) => {
    const filteredData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== null && value !== undefined));

    const searchParams = new URLSearchParams(filteredData).toString();

    navigate(`/ap/students/${data.employeeId}?${searchParams}&&isNSFAS=true`);
  };

  const renderTableRows = (students: any[]) =>
    students.map((student) => {
      return (
        <TableRow key={student.employeeId}>
          <TableCell className="font-medium">{student.name}</TableCell>
          <TableCell>{student.idNumber}</TableCell>
          <TableCell>{student.mobile}</TableCell>
          <TableCell>{student.email}</TableCell>
          {/* <TableCell>
            <Badge variant={getStatusBadgeClass(student.statustext)}>{student.statustext}</Badge>
          </TableCell> */}
          <TableCell className="text-right">
            <Button
              variant="outline"
              size="default"
              onClick={() =>
                isNsfas ? handleSendSearchParams(student) : navigate(`/ap/students/${student.employeeId}?number=${student.mobile}`)
              }
            >
              View
            </Button>
          </TableCell>
        </TableRow>
      );
    });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="font-medium text-2xl flex justify-center">
          <Spinner className="text-orange-500" />
        </div>
      );
    }

    if (isError) {
      return <ErrorCard error={error.data} onSearchAgain={handleClearSearch} />;
    }
    if (isSuccess && searchData?.Listing.length < 1) {
      return <EmptyCard onSearchAgain={handleClearSearch} onInvite={() => setIsInviteStudent(true)} />;
    }

    if (isSuccess && searchData?.Listing.length < 1) {
      return <NoResultsCard onSearchAgain={handleClearSearch} />;
    }

    if (isSuccess && searchData?.Listing.length > 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Student Name</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderTableRows(searchData?.Listing)}</TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full bg-inherit shadow-none  mx-auto border-none">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
          {/* Icon */}
          <div className="p-3  rounded-full">
            <Illustration />
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 max-w-56 text-center">Search for students using ID number.</h2>
          <h2 className="text-lg text-gray-400 font-medium  max-w-96 text-center">
            After completing your search, student profiles will be shown here.
          </h2>
        </CardContent>
      </Card>
    );
  };
  const breadcrumbItems = [{ path: '/ap/students/search', label: 'Student Search' }];
  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />
      {isInviteStudent ? (
        <InviteStudent id={searchText} />
      ) : (
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Student Search</h1>
            <p className="text-gray-500">Find a student by ID number</p>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-2  mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Student ID number"
                className="pl-10 pr-8 py-6 bg-white"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3  top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="lg"
              className={`w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] h-12 bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f] ${isLoading ? 'cursor-not-allowed' : ''}`}
              onClick={handleSearch}
              disabled={isLoading}
            >
              {!isLoading && <SearchIcon />} {isLoading ? <Spinner className="text-white" /> : 'Search Student'}
            </Button>
          </div>

          {renderContent()}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentSearch;
