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
  Phone,
  MessageSquare,
  User,
  Calendar,
  Home,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetCasesMutation } from '@/services/apiService';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageLoder from '@/components/PageLoder';
import { addOrUpdateFilter, convertToFilterObject, deleteFilter, findBulkActionFilterName, getStatusBadgeClass, mapFilters } from '@/utils';
import Breadcrumb from '@/components/BreadCrumb';
import InsightCard from '@/components/InsightCard';
import ErrorPage from '@/components/ErrorPage';
import EmptyState from '@/components/EmptyState';
import EnhancedPagination from '@/components/EnhancedPagination';
import { useGetListingActionsMutation } from '@/services/portalListingService';
import { useBiilingListingReqMutation, useExportBillingListingReqMutation } from '@/services/monthlyRentalService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import FilterPopover from './Filter';
import { createNewFilterArray } from '@/utils/helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
  console.log('bulk', bulkActionState);
  console.log('status', statusFilter);

  const navigate = useNavigate();

  const { relatedObjectId } = useSelector((state: RootState) => state.auth.user);
  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const dispatch = useDispatch();

  const [BiilingListingReq, billingProps] = useBiilingListingReqMutation();
  const [ExportBillingListingReq, exportProps] = useExportBillingListingReqMutation();
  const [GetListingActions, actionsProps] = useGetListingActionsMutation();

  const handleUpdateFilter = (newFilter) => {
    addOrUpdateFilter(newFilter, setFilters);
  };

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
    setPageNumber(1);
  };

  useEffect(() => {
    const bulkFilters = filters?.filter((filter) => !filter?.isBulkAction);
    const nonBulkActionFilters = actionsProps?.data?.ListingActionFilters.filter(
      (filter: any) => filter.portalListingId === bulkFilters[0]?.PortalListingId
    );
    if (nonBulkActionFilters?.length > 0) {
      const bulkFilters2 = nonBulkActionFilters[0]?.actionFilters.filter(
        (filter) => filter?.portalListingFilterId === bulkFilters[0]?.ActionFilterId
      );
      setStatusFilter(bulkFilters2[0].filterName);
    }
  }, [filters]);

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

  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (billingProps.isSuccess && !hasInitialized.current) {
      const newActions = billingProps?.data?.ListingFilters.map((item) => ({
        ActionFilterId: item.actionFilterId,
        PortalListingId: item.portalListingId,
      }));
      setFilters(newActions);
      hasInitialized.current = true;
    }
  }, [billingProps.isSuccess, billingProps?.data?.ListingFilters]);

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

  // Get the name of any bulk action filter in the user's selections
  const bulkActionName = findBulkActionFilterName(filters, actionsProps?.data?.ListingActionFilters);
  console.log('bulkActionName', bulkActionName); // Will return the filter name or empty string

  // Example usage:
  const mappedFilters = mapFilters(filters, actionsProps?.data?.ListingActionFilters);
  console.log('mappedFilters', mappedFilters);

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

  // const CommentCell = ({ comment }: any) => {
  //   const maxLength = 20; // Maximum characters to display
  //   const isLong = comment && comment.length > maxLength;
  //   const displayText = isLong ? `${comment.substring(0, maxLength)}...` : comment;

  //   if (!comment) return <span>-</span>;

  //   return (
  //     <div className="flex items-center gap-1">
  //       <span>{displayText}</span>
  //       {isLong && (
  //         <Popover>
  //           <PopoverTrigger>
  //             <Eye className="h-4 w-4 cursor-pointer text-blue-500 hover:text-blue-700" />
  //           </PopoverTrigger>
  //           <PopoverContent className="w-80 max-h-60 overflow-auto p-0 rounded-lg border-blue-100 shadow-lg bg-white">
  //             <div className="space-y-2 pb">
  //               <div className="p-3 bg-orange-50 border-b border-orange-100">
  //                 <h4 className="font-medium text-sm text-orange-800">Full Comment</h4>
  //               </div>
  //               <div className="p-2">
  //                 <p className="text-sm text-gray-700">{comment}</p>
  //               </div>
  //             </div>
  //           </PopoverContent>
  //         </Popover>
  //       )}
  //     </div>
  //   );
  // };

  const CommentCell = ({ comment, length = 20 }: any) => {
    const maxLength = length; // Maximum characters to display
    const isLong = comment && comment.length > maxLength;
    const displayText = isLong ? `${comment.substring(0, maxLength)}...` : comment;

    if (!comment) return <span>-</span>;

    return (
      <div className="group relative inline-block">
        <span>{displayText}</span>
        {isLong && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/10">
            <Popover>
              <PopoverTrigger>
                <Eye className="h-5 w-5 cursor-pointer text-blue-500 hover:text-blue-700 drop-shadow-sm" />
              </PopoverTrigger>
              <PopoverContent className="w-80 max-h-60 overflow-auto p-0 rounded-lg border-blue-100 shadow-lg bg-white">
                <div className="space-y-2 pb">
                  <div className="p-3 bg-orange-50 border-b border-orange-100">
                    <h4 className="font-medium text-sm text-orange-800">Full Comment</h4>
                  </div>
                  <div className="p-2">
                    <p className="text-sm text-gray-700">{comment}</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    );
  };

  const MobileCard = ({ case_ }) => (
    <Card className="mb-4 shadow-sm">
      <CardContent className="p-4">
        {/* Header with Student Name and Phone Icon */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg text-gray-900">{case_.studentName}</h3>
          <div className="bg-gray-100 p-2 rounded-full">
            <Phone className="h-4 w-4 text-gray-600" />
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={getStatusBadgeClass(case_.paymentStatus)} className="text-xs">
            {case_.paymentStatus}
          </Badge>
          {case_.facilityName && (
            <Badge variant="outline" className="text-xs">
              {case_.facilityName}
            </Badge>
          )}
          {case_.numberOfMonths && (
            <Badge variant="secondary" className="text-xs">
              {case_.numberOfMonths} months
            </Badge>
          )}
        </div>

        {/* Date */}
        <p className="text-sm text-gray-500 mb-3">
          {case_.month} {case_.year}
        </p>

        {/* Details Grid */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ID Number:</span>
            <span className="font-medium">{case_.idNumber}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Allocation Request:</span>
            <span className="font-medium">{formatCurrency(case_.allocationRequest)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Allocation Approved:</span>
            <span className="font-medium">{formatCurrency(case_.allocationApproved)}</span>
          </div>

          {case_.comments && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-600 block mb-1">Comments:</span>
              <CommentCell comment={case_.comments} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Desktop Table Component
  const DesktopTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead>Student</TableHead>
          <TableHead>Id Number</TableHead>
          <TableHead>Residence</TableHead>
          <TableHead>Allocation Request</TableHead>
          <TableHead>Allocation Approved</TableHead>
          <TableHead>Months</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Comments / Exceptions</TableHead>
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
              {case_.month} {case_.year}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeClass(case_.paymentStatus)}>{case_.paymentStatus}</Badge>
            </TableCell>
            <TableCell>
              <CommentCell comment={case_.comments} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
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
          <FilterPopover filters={actionsProps?.data?.ListingActionFilters} activeFilters={filters} onApplyFilters={handleApplyFilters} />

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

          {/* Search Results */}
          {isSearch && (
            <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-lg flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-gray-700 text-sm mr-1.5">Showing results for:</span>
                <span className="text-blue-700 font-medium">{searchTerm}</span>
              </div>
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={() => {
                  setSearchTerm('');
                  setIsSearch(!isSearch);
                }}
              >
                <X className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 my-2">
            {mappedFilters.length > 0 && <span className="text-sm text-gray-600 mr-1">Filters:</span>}
            {mappedFilters.map((filter, index) => (
              <div
                className="px-3 py-1.5 rounded-full bg-gray-50 flex items-center gap-1.5 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
                key={index}
              >
                <span className="text-sm">{filter.action}</span>
                <div
                  className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  onClick={() => {
                    const filterObject = convertToFilterObject(filter, actionsProps?.data?.ListingActionFilters);
                    deleteFilter(filterObject?.PortalListingId, setFilters);
                  }}
                >
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
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
                          value={bulkActionName}
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
                              handleUpdateFilter(filteredItem2[0]);
                            }

                            // if (filteredItem2.length>0) {
                            // }

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
              {/* <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Student</TableHead>
                    <TableHead>Id Number</TableHead>
                    <TableHead>Residence</TableHead>
                    <TableHead>Allocation Request</TableHead>
                    <TableHead>Allocation Approved</TableHead>
                    <TableHead>Months</TableHead>
                    <TableHead>Date</TableHead>
                    {/* <TableHead>Allocation Status</TableHead> */}
              {/* <TableHead>Payment Status</TableHead>
                    <TableHead>Comments / Exceptions</TableHead>
                  </TableRow>
                </TableHeader> */}
              {/* <TableBody>
                  {billingProps?.data?.Listing.map((case_) => (
                    <TableRow key={case_.idNumber}>
                      <TableCell className="font-medium">{case_.studentName}</TableCell>
                      <TableCell>{case_.idNumber}</TableCell>
                      <TableCell>{case_.facilityName}</TableCell>
                      <TableCell>{formatCurrency(case_.allocationRequest)}</TableCell>
                      <TableCell>{formatCurrency(case_.allocationApproved)}</TableCell>
                      <TableCell>{case_.numberOfMonths}</TableCell>
                      <TableCell>{case_.month} {case_.year}</TableCell> */}
              {/* <TableCell>
                        <Badge variant={getStatusBadgeClass(case_.allocationStatus)}>{case_.allocationStatus}</Badge>
                      </TableCell> */}
              {/* <TableCell>
                        <Badge variant={getStatusBadgeClass(case_.paymentStatus)}>{case_.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <CommentCell comment={case_.comments} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>  */}

              <>
                {/* Mobile View - Hidden on desktop */}
                <div className="block md:hidden">
                  <div className="space-y-4">
                    {billingProps?.data?.Listing.map((case_) => (
                      <CompactMobileCard
                        formatCurrency={formatCurrency}
                        getStatusBadgeClass={getStatusBadgeClass}
                        CommentCell={CommentCell}
                        key={case_.idNumber}
                        case_={case_}
                      />
                    ))}
                  </div>
                </div>

                {/* Desktop View - Hidden on mobile */}
                <div className="hidden md:block">
                  <DesktopTable />
                </div>
              </>

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

const CompactMobileCard = ({ case_, formatCurrency, getStatusBadgeClass, CommentCell }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Get status icon based on payment status
  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes('paid') || statusLower?.includes('approved')) {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
    if (statusLower?.includes('pending')) {
      return <Clock className="h-3 w-3 text-yellow-500" />;
    }
    if (statusLower?.includes('failed') || statusLower?.includes('rejected')) {
      return <XCircle className="h-3 w-3 text-red-500" />;
    }
    return <AlertTriangle className="h-3 w-3 text-gray-500" />;
  };

  const formatCurrenc = (amount: any) => {
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
  // Detailed view component
  const DetailView = () => (
    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {case_.studentName}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Payment Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {/* {getStatusIcon(case_.paymentStatus)} */}
            <span className="text-sm font-medium">Payment Status</span>
          </div>
          <Badge variant={getStatusBadgeClass(case_.paymentStatus)} className="text-xs">
            {case_.paymentStatus}
          </Badge>
        </div>

        {/* Student Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">ID Number</p>
              <p className="text-sm font-medium">{case_.idNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Home className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Residence</p>
              <p className="text-sm font-medium">{case_.facilityName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Period</p>
              <p className="text-sm font-medium">
                {case_.month} {case_.year}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 flex items-center gap-2">Financial Details</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-blue-600">Requested</p>
              <p className="text-sm font-bold text-blue-800">{formatCurrency(case_.allocationRequest)}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Approved</p>
              <p className="text-sm font-bold text-blue-800">{formatCurrency(case_.allocationApproved)}</p>
            </div>
          </div>
        </div>

        {/* Comments */}
        {case_.comments && (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-800 flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4" />
              Comment
            </h4>
            <p className="text-sm">{case_.comments}</p>
            {/* <CommentCell comment={case_.comments} length={40} /> */}
          </div>
        )}
      </div>
    </DialogContent>
  );

  return (
    <Card className="mb-2 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <h3 className="font-medium text-sm text-gray-900 truncate">{case_.studentName}</h3>
          </div>
        </div>

        {/* Compact Info Row */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              <span className=" max-w-[80px]">{case_.facilityName}</span>
            </div>
          </div>
          <span className="text-gray-500">
            {case_.month} {case_.year}
          </span>
        </div>

        {/* Financial Summary & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-700">{formatCurrenc(case_.allocationApproved)}</span>
          </div>

          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DetailView />
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
