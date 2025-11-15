import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, Calendar, Filter, MoreVertical, ChevronRight, Search, X, House, AlertCircle, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetStudentsPropetyApplicationsMutation, useStudentRevokeApplicationMutation } from '@/services/apiService';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { Spinner } from '@/components/ui/spinner';
import Breadcrumb from '@/components/BreadCrumb';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';
import { getStatusBadgeClass } from '@/utils';
import EmptyState from '@/components/EmptyState';
import ErrorPage from '@/components/ErrorPage';
import { Badge } from '@/components/ui/badge';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import SuccessPage from '@/components/SuccessPage';

// Mobile Card Component for applications
const ApplicationCard = ({ app, navigate, handleRevoke }) => (
  <Card className="mb-4 mx-2">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <House className="h-5 w-5 text-gray-500" />
          <Button
            variant="link"
            className="p-0 h-auto text-black font-medium"
            onClick={() => navigate(`/student/accomodation-details/${app.facilityId}`)}
          >
            {app.name}
          </Button>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border border-orange-500 text-orange-500 hover:text-orange-500">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="font-medium" onClick={() => navigate(`/student/accomodation-details/${app.facilityId}`)}>
              <ExternalLink className="mr-2 h-4 w-4" /> View details
            </DropdownMenuItem>
            {app.applicationStatusId != 'Approved' && (
              <DropdownMenuItem className="font-medium" onClick={() => handleRevoke(app.accomodationApplicationsId)}>
                <AlertCircle className="mr-2 h-4 w-4" /> Cancel Application
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <Badge variant={getStatusBadgeClass(app.applicationStatusId)}>{app.applicationStatusId}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Application Date:</span>
          <span>{app.applicationDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Room Type:</span>
          <span>{app.roomType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Move in Date:</span>
          <span>{app.plannedMoveInDate}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ApplicationsView = () => {
  const navigate = useNavigate();
  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  const [
    getStudentsPropetyApplications,
    {
      data: applications,
      isLoading: isLoadingApplications,
      isSuccess: isSuccessApplications,
      isError: isErrorApplications,
      error: errorApplications,
    },
  ] = useGetStudentsPropetyApplicationsMutation();
  const [
    studentRevokeApplication,
    { data: revoke, isLoading: isLoadingRevoke, isSuccess: isSuccessRevoke, isError: isErrorRevoke, error: errorRevoke },
  ] = useStudentRevokeApplicationMutation();

  useEffect(() => {
    getStudentsPropetyApplications({
      body: {
        recordId: userDetails.recordId,
        requestName: 'RetrieveStudentApplications',
      },
    });
  }, []);

  const handleRevoke = (applicationId) => {
    studentRevokeApplication({
      body: {
        entityName: 'AccomodationApplications',
        requestName: 'UpsertRecordReq',
        recordId: applicationId,
        inputParamters: {
          Entity: {
            StatusId: 335,
            IsActive: 0,
          },
        },
      },
    });
  };

  if (isSuccessRevoke) {
    return (
      <SuccessPage
        description={revoke?.clientMessage}
        title={'Application Revoked'}
        secondaryAction={{
          label: 'Go Home',
          onClick: () => navigate('/'),
        }}
      />
    );
  }

  if (isErrorRevoke) {
    showErrorToast(errorRevoke?.data);
  }

  const breadcrumbItems = [{ path: '/dashboard/accommodation', label: 'Accommodation Application' }];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {isLoadingApplications && <Spinner size="large" />}
        {isErrorApplications && <ErrorPage message={errorApplications.data} />}

        {isSuccessApplications && applications.Applications.length < 1 && (
          <EmptyState
            title="No applications found"
            description="Create your first item to get started"
            icon={EmptyStateIcon}
            // action={{
            //   label: 'Add Application',
            //   onClick: () => navigate('/student/search-residence'),
            // }}
          />
        )}

        {isSuccessApplications && applications?.Applications.length > 0 && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">All Applications</CardTitle>
              <CardDescription>View and manage your current applications</CardDescription>
            </CardHeader>
            <div>{isLoadingRevoke && <Spinner />}</div>
            <CardContent className="p-0 sm:p-6">
              {/* Mobile View */}
              <div className="block sm:hidden">
                {applications.Applications.map((app) => (
                  <ApplicationCard key={app.id} app={app} navigate={navigate} handleRevoke={handleRevoke} />
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="w-[300px] font-medium">Name of Residence</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Application Date</TableHead>
                      <TableHead className="font-medium">Type of Room</TableHead>
                      <TableHead className="font-medium">Planned Move in Date</TableHead>
                      <TableHead className="font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.Applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <House className="h-5 w-5" />
                            <Button
                              variant="link"
                              className="pl-0 text-black"
                              onClick={() => navigate(`/student/accomodation-details/${app.facilityId}`)}
                            >
                              {app.name}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeClass(app.applicationStatusId)}>{app.applicationStatusId}</Badge>
                        </TableCell>
                        <TableCell>{app.applicationDate}</TableCell>
                        <TableCell>{app.roomType}</TableCell>
                        <TableCell>{app.plannedMoveInDate}</TableCell>
                        <TableCell>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border border-orange-500 text-orange-500 hover:text-orange-500"
                              >
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="font-medium"
                                onClick={() => navigate(`/student/accomodation-details/${app.facilityId}`)}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" /> View details
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem
                                className="font-medium"
                                onClick={() =>
                                  navigate(`/student/applcation/${app.accomodationApplicationsId}/update?roomType=${app.roomType}&&plannedMoveInDate=${app.plannedMoveInDate}`)
                                }
                              >
                                <ExternalLink className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem> */}
                              {app.applicationStatusId != 'Approved' && (
                                <DropdownMenuItem className="font-medium" onClick={() => handleRevoke(app.accomodationApplicationsId)}>
                                  <AlertCircle className="mr-2 h-4 w-4" /> Cancel Application
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationsView;
