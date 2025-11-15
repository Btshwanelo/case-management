import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  MoreVertical,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  Plus,
  ExternalLink,
  X,
  Download,
  Wallet2,
  Banknote,
  User2,
  UserCheck2,
  UserMinus2,
  Eye,
  Info,
  ChevronsUpDown,
  ChevronsUpDownIcon,
} from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetCasesMutation } from '@/services/apiService';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageLoder from '@/components/PageLoder';
import { getStatusBadgeClass } from '@/utils';
import Breadcrumb from '@/components/BreadCrumb';
import InsightCard from '@/components/InsightCard';
import ErrorPage from '@/components/ErrorPage';
import EmptyState from '@/components/EmptyState';
import EnhancedPagination from '@/components/EnhancedPagination';
import { useGetListingActionsMutation } from '@/services/portalListingService';
import { useBiilingListingReqMutation, useExportBillingListingReqMutation } from '@/services/monthlyRentalService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import FilterPopover from '../AP/Tenants/Filter';
import { createNewFilterArray } from '@/utils/helpers';

const BillingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loaderType, setLoaderType] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [filters, setFilters] = useState([]);
  console.log('filters', filters);

  const [bulkActionState, setBulkActionState] = useState({
    actions: [],
    selectedAction: 'All',
  });

  const navigate = useNavigate();

  const { relatedObjectId } = useSelector((state: RootState) => state.auth.user);
  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const dispatch = useDispatch();

  const [BiilingListingReq, billingProps] = useBiilingListingReqMutation();
  const [ExportBillingListingReq, exportProps] = useExportBillingListingReqMutation();
  const [GetListingActions, actionsProps] = useGetListingActionsMutation();

  useEffect(() => {
    BiilingListingReq({
      body: {
        entityName: 'MonthlyRental',
        requestName: 'BiilingListingReq',
        inputParamters: {
          AccommodationProviderId: userDetails.supplierId,
          Filters: filters,
          SearchText: searchTerm,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      },
    });
  }, [isSearch, pageNumber, filters, bulkActionState]);
  useEffect(() => {
    if (billingProps.isSuccess) {
      setFilters(billingProps?.data?.ListingFilters);
    }
  }, []);

  const handleExport = () => {
    ExportBillingListingReq({
      body: { entityName: 'MonthlyRental', requestName: 'ExportBillingListingReq', inputParamters: { supplierId: userDetails.supplierId } },
    });
  };

  const handleApplyFilters = (values: any) => {
    if (!actionsProps?.data?.ListingActionFilters) return;

    const nonBulkActionFilters = actionsProps?.data?.ListingActionFilters.filter((filter: any) => !filter.isBulkAction);

    const newArr = createNewFilterArray(nonBulkActionFilters, values);
    setFilters(newArr);
  };

  useEffect(() => {
    GetListingActions({
      body: {
        entityName: 'PortalListing',
        requestName: 'GetListingActions',
        inputParamters: {
          UserId: userDetails.supplierId,
          UserType: 'Supplier',
          PageRoute: '/billing',
          PageName: 'Billing',
        },
      },
    });
  }, []);
  const formatCurrency = (amount: any) => {
    if (amount >= 1_000_000) {
      return `R${(amount / 1_000_000).toFixed(2)}M`;
    }
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const summaryData = [
    {
      title: 'Total Claimed',
      value: formatCurrency(billingProps?.data?.Summary.totalClaimed),
      subtitle: 'All Time',
      icon: <Wallet2 className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-200',
    },
    {
      title: 'Total Approved',
      value: formatCurrency(billingProps?.data?.Summary.totalApproved),
      subtitle: 'Active',
      icon: <Banknote className="h-5 w-5 text-yellow-500" />,
      bgColor: 'bg-yellow-200',
    },
    {
      title: '# Students Claimed',
      value: billingProps?.data?.Summary.totalNumberofStudents,
      subtitle: 'Resolved',
      icon: <User2 className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-200',
    },
    {
      title: '# Students Approved',
      value: billingProps?.data?.Summary.totalNumberofStudentsApproved,
      subtitle: 'Pending',
      icon: <UserCheck2 className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-red-200',
    },
    {
      title: '# Students Rejected',
      value: billingProps?.data?.Summary.totalNumberofStudentsRejected,
      subtitle: 'Pending',
      icon: <UserMinus2 className="h-5 w-5 text-red-500" />,
      bgColor: 'bg-red-200',
    },
  ];

  const downloadFile = async (data: { name: string; extension: string; content: unknown }) => {
    const a = document.createElement('a');
    a.download = data.name + '.' + data.extension;
    a.href = `data:text/${data.extension};base64,${data.content}`;
    a.click();
  };
  useEffect(() => {
    if (exportProps.isSuccess) {
      downloadFile({ name: exportProps.data?.file[0]?.name, extension: 'xlsx', content: exportProps.data?.file[0]?.content });
    }
  }, [exportProps.isSuccess]);

  const CommentCell = ({ comment }: any) => {
    const maxLength = 50; // Maximum characters to display
    const isLong = comment && comment.length > maxLength;
    const displayText = isLong ? `${comment.substring(0, maxLength)}...` : comment;

    if (!comment) return <span>-</span>;

    return (
      <div className="flex items-center gap-1">
        <span>{displayText}</span>
        {isLong && (
          <Popover>
            <PopoverTrigger>
              <Eye className="h-4 w-4 cursor-pointer text-blue-500 hover:text-blue-700" />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 max-h-60 overflow-auto rounded-lg border-blue-100 shadow-lg bg-white">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600 border-b pb-1">Full Comment</h4>
                <p className="text-sm text-gray-700">{comment}</p>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  };

  const totalRecords = billingProps?.data?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const breadcrumbItems = [{ path: '/billing', label: 'Billing' }];
  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {billingProps.isLoading && <PageLoder />}
      {billingProps.isError && <ErrorPage message={billingProps?.error?.data} />}

      {billingProps.isSuccess && (
        <div className="mx-auto space-y-6">
          <FilterPopover filters={actionsProps?.data?.ListingActionFilters} onApplyFilters={handleApplyFilters} />

          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-2"></div>
            {/* <Button onClick={handleCreateCase} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create New Case
            </Button> */}
          </div>

          {/* Insight Cards */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 pb-2">
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

          {/* Cases Table Card */}
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="text-xl flex justify-between">
                <div>Billing</div>
                <div className="flex gap-2">
                  <Button variant="default" disabled={exportProps.isLoading} type="button" onClick={handleExport}>
                    <Download /> {exportProps.isLoading ? 'Exporting...' : 'Export'}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>View and manage your billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row  justify-between mb-6 gap-2">
                <div className="flex flex-row gap-2 w-full md:w-1/3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search..."
                      className="pl-10 pr-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setIsSearch(!isSearch);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <Button variant="outline" className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsSearch(!isSearch)}>
                    <Search className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="flex flex-row gap-2">
                  {actionsProps.data?.ListingActionFilters.map(
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

                  {bulkActionState.actions.length > 0 && (
                    <Select
                      value={bulkActionState.selectedAction}
                      onValueChange={(value) => setBulkActionState((prev) => ({ ...prev, selectedAction: value }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Bulk Action" />
                      </SelectTrigger>
                      <SelectContent>
                        {bulkActionState.actions.length > 0 ? (
                          bulkActionState.actions.map((action) => (
                            <SelectItem key={action.actionName} value={action.actionName}>
                              {action.actionName}
                            </SelectItem>
                          ))
                        ) : (
                          <p>No Action</p>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Cases Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Student</TableHead>
                    <TableHead>Id Number</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Allocation Request</TableHead>
                    <TableHead>Allocation Approved</TableHead>
                    <TableHead>Months</TableHead>
                    <TableHead>Allocation Status</TableHead>
                    <TableHead>Paymment Status</TableHead>
                    {/* <TableHead>Comments</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingProps?.data?.Listing.map((case_) => (
                    <TableRow key={case_.idNumber}>
                      <TableCell className="font-medium">{case_.studentName}</TableCell>
                      <TableCell>{case_.idNumber}</TableCell>
                      <TableCell>{case_.facilityName}</TableCell>
                      <TableCell>{formatCurrency(case_.allocationRequest)}</TableCell>
                      <TableCell>{formatCurrency(case_.allocationApproved)}</TableCell>
                      <TableCell>{case_.numberOfMonths}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeClass(case_.allocationStatus)}>{case_.allocationStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeClass(case_.paymentStatus)}>{case_.paymentStatus}</Badge>
                      </TableCell>
                      {/* <TableCell>
                      <CommentCell comment={case_.comments} />
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {billingProps?.data?.Listing.length > 0 && (
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

              {billingProps.isSuccess && billingProps?.data?.Listing.length < 1 && (
                <EmptyState title="No billing found" description="Create your first item to get started" icon={EmptyStateIcon} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BillingPage;
