import React, { useEffect, useState } from 'react';
import {
  useEmployeeRetrieveTargetInstiPropertiesMutation,
  useExportStudentsMutation,
  useGetTenantListingActionMutation,
} from '@/services/apiService';
import { Search, Filter, Home, X, CheckCircle, Download } from 'lucide-react';
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
import EnhancedPagination from '@/components/EnhancedPagination';
import { useNavigate } from 'react-router-dom';
import { getStatusBadgeClass } from '@/utils';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';

const PropertyList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const userDetails = useSelector((state: RootState) => state.details);
  const [filters, setFilters] = useState([]);

  const [loaderType, setLoaderType] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [bulkActionState, setBulkActionState] = useState({
    actions: [],
    selectedAction: 'All',
  });

  const [employeeRetrieveTargetInstiProperties, { data, isLoading, isSuccess, isError, error }] =
    useEmployeeRetrieveTargetInstiPropertiesMutation();
  const [exportStudents, { isLoading: isLoadingExport, isSuccess: isSuccessExport, isError: isErrorExport, data: dataExport }] =
    useExportStudentsMutation();
  const [
    getTenantListingAction,
    {
      isLoading: isLoadingTenantListingAction,
      isError: isErrorTenantListingAction,
      isSuccess: isSuccessTenantListingAction,
      data: dataTenantListingAction,
      error: errorTenantListingAction,
    },
  ] = useGetTenantListingActionMutation();
  useEffect(() => {
    employeeRetrieveTargetInstiProperties({
      body: {
        entityName: 'Employee',
        requestName: 'RetrieveTargetInstiProperties',
        inputParamters: {
          SupplierId: userDetails.requestResults.supplierId,
          SearchText: searchTerm,
          PageNumber: pageNumber,
          PageSize: pageSize,
          Filters: filters,
          Status: statusFilter,
        },
      },
    });
  }, [isSearch, pageNumber, statusFilter, filters, bulkActionState]);
  useEffect(() => {
    getTenantListingAction({
      body: {
        entityName: 'PortalListing',
        requestName: 'GetListingActions',
        inputParamters: {
          UserId: userDetails.requestResults.supplierId,
          UserType: 'Supplier',
          PageRoute: '/property-list',
          PageName: 'RetrieveTargetInstiProperties',
        },
      },
    });
  }, []);

  const stats = data?.Summary || {
    totalProperties: 0,
    draft: 0,
    pendingGrading: 0,
    approved: 0,
  };

  const summaryData = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      subtitle: '',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-200',
      // borderColor: 'border-yellow-300',
    },
    {
      title: 'NSFAS Accredited',
      value: stats.nsfasAccredited,
      subtitle: '',
      icon: <CheckCircle className="h-5 w-5 text-yellow-500" />,
      bgColor: 'bg-yellow-200',
      // borderColor: 'border-blue-300',
    },
    {
      title: 'Institution Owned',
      value: stats.institutionOwned,
      subtitle: '',
      icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-200',
      // borderColor: 'border-green-300',
    },
    {
      title: 'Institution Leased',
      value: stats.institutionLeased,
      subtitle: '',
      icon: <CheckCircle className="h-5 w-5 text-red-500" />,
      bgColor: 'bg-red-200',
      // borderColor: 'border-red-300',
    },
    {
      title: 'Institution Accredited',
      value: stats.institutionAccredited,
      subtitle: '',
      icon: <CheckCircle className="h-5 w-5 text-purple-500" />,
      bgColor: 'bg-red-200',
      // borderColor: 'border-red-300',
    },
  ];

  const handleExport = () => {
    exportStudents({
      body: {
        entityName: 'Facility',

        requestName: 'ExportInstitutionListing',

        inputParamters: {
          supplierId: userDetails.requestResults.supplierId,
        },
      },
    });
  };

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

  const totalRecords = data?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const breadcrumbItems = [{ path: '/applications', label: 'Properties' }];

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isError && <ErrorPage message={error?.data} />}
      {isLoading && <PageLoder />}

      {isSuccess && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {summaryData.map((item, index) => (
              <InsightCard
                key={index}
                icon={item.icon}
                title={item.title}
                value={item.value}
                subtitle={item.subtitle}
                iconBgColor={item.bgColor}
                borderColor={item.borderColor}
              />
            ))}
          </div>

          {isSearch && (
            <div className="bg-blue-100  px-6 py-2 rounded-lg text-blue-600 font-semibold flex justify-between">
              <div>
                <span className="text-black"> Showing search results for </span> {searchTerm}
              </div>{' '}
              <X
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  setSearchTerm('');
                  setIsSearch(!isSearch);
                }}
              />{' '}
            </div>
          )}

          {/* Applications List */}
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="text-xl flex justify-between">
                <div>All Properties</div>
                <div className="flex gap-2">
                  <Button variant="default" type="button" onClick={() => navigate('/property-list/add-property')}>
                    + Add Property
                  </Button>
                  <Button variant="default" type="button" onClick={handleExport}>
                    <Download /> Export
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>View and manage properties</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2 w-1/3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search properties..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsSearch(!isSearch)}>
                    <Search className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="flex gap-4">
                  {/* <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Private Accommodation">Private Accommodation</SelectItem>
                      <SelectItem value="Institution Accredited">Institution Accredited</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Institution Leased">Institution Leased</SelectItem>
                      <SelectItem value="Institution Owned Residence">Institution Owned Residence</SelectItem>
                    </SelectContent>
                  </Select> */}

                  {dataTenantListingAction?.ListingActionFilters.map(
                    (action, index) =>
                      action.isBulkAction === true && (
                        <Select
                          key={index}
                          value={statusFilter}
                          onValueChange={(value) => {
                            const filteredItem = action?.actionFilters.find((item) => item.filterName === value);

                            const filteredItem2 = action?.actionFilters
                              .filter((item) => item.filterName === value) // Filter for items with "filterName" as "Lapsed"
                              .map((item) => ({
                                PortalListingId: action.portalListingId, // Static value as per the requirement
                                ActionFilterId: item.portalListingFilterId, // Map portalListingFilterId to ActionFilterId
                              }));

                            if (filteredItem) {
                              setBulkActionState({
                                actions: filteredItem.actions,
                                selectedAction: filteredItem.filterName,
                              });
                              setFilters(filteredItem2);
                            } else {
                              console.error(`No matching item found for filterName: ${value}`);
                            }

                            setStatusFilter(value);
                            setPageNumber(1); //reset page number
                          }}
                        >
                          {' '}
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={action?.label} />
                          </SelectTrigger>
                          <SelectContent>
                            {action.actionFilters.map((filter) => (
                              <SelectItem key={filter.portalListingFilterId} value={filter.filterName}>
                                {filter.filterName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                  )}
                </div>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Accommodation Provider</TableHead>
                    <TableHead>Property Name</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Accommodation Type</TableHead>
                    <TableHead> Grade</TableHead>
                    <TableHead>KM to Campus</TableHead>
                    <TableHead>Total Beds</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.Listing?.map((item) => (
                    <TableRow key={item.facilityId}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">{item.accommodationProvider}</TableCell>
                      <TableCell className="">{item.facilityName}</TableCell>
                      <TableCell>{item.campusIdName}</TableCell>
                      <TableCell>{item.accomodationTypes}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeClass(item.grading)}>{item.grading}</Badge>
                      </TableCell>
                      <TableCell>{item.kMsToCampus}</TableCell>
                      <TableCell>{item.numberOFBeds}</TableCell>

                      <TableCell>
                        <Button
                          onClick={() => navigate(`/intitution/property-details/${item.facilityId}`)}
                          variant="outline"
                          size="sm"
                          className="border border-orange-500 text-orange-500 hover:text-orange-500"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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

              {isSuccess && data?.Listing.length < 1 && (
                <EmptyState title="No properties found" description="No applications found" icon={EmptyStateIcon} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PropertyList;
