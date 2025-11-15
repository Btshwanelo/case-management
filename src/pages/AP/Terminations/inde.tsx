import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  X,
  FolderOpen,
  Download,
  Trash2,
  Signature,
  Eye,
  View,
  Recycle,
} from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  useEmployeeMutation,
  useExportStudentsMutation,
  useGetTenantListingActionMutation,
  useGetTenantListingMutation,
  useRenewTenantMutation,
  useRetrieveSignwellReqMutation,
} from '@/services/apiService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { Spinner } from '@/components/ui/spinner';
import SuccessToast, { showSuccessToast } from '@/components/SuccessToast';
import FilterPopover from './Filter';
import PageLoder from '@/components/PageLoder';
import { getStatusBadgeClass } from '@/utils';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/BreadCrumb';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';
import ErrorPage from '@/components/ErrorPage';
import EmptyState from '@/components/EmptyState';
import { showErrorToast } from '@/components/ErrorToast ';
import EnhancedPagination from '@/components/EnhancedPagination';
import InsightCard from '@/components/InsightCard';
import SignWellWindow from '@/components/SignWellWindow';
import { showMessageToast } from '@/components/MessageToast';
import { useTenantRegenerateLeaseMutation, useTerminateTenantReqMutation } from '@/services/tenantService';
import TerminateModal from './Terminatemodal';
import { createNewFilterArray, downloadFile } from '@/utils/helpers';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SuccessPage from '@/components/SuccessPage';
import EzraSignModal from '@/components/SignWellWindow/EzraSignModal';
import { useTerminationListingMutation } from '@/services/facilityService';
import FilePreviewModal from '@/components/FilePreviewModal';

const Terminations = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [previewFile, setPreviewFile] = useState(false);
  const navigate = useNavigate();
  const [tenantListing, setTenantListing] = useState([]);

  const [statusActionFilter, setStatusActionFilter] = useState([]);
  const [statusActionFilterValue, setStatusActionFilterValue] = useState('');

  const [bulkActions, setBulkActions] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const [selectedTenants, setSelectedTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState();
  const [tenantId, setTenantId] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState([]);

  const [showSignWellWindow, setShowSignWellWindow] = useState(false);
  const [signWellUrl, setSignWellUrl] = useState('');
  const [signwellAction, setSignwellAction] = useState('');

  const [loaderType, setLoaderType] = useState('');
  const [isShowTerminateModal, setIsShowTerminateModal] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTenants([]);
      setSelectedValue('');
    } else {
      const allTenantIds = dataTenantListing?.Listing.map((tenant) => tenant.tenantId);
      setSelectedTenants(allTenantIds);
      setSelectedValue('all');
    }
    setSelectAll(!selectAll);
  };

  // Handle individual selection
  const handleSelectTenant = (tenantId) => {
    setSelectedValue(tenantId);

    setSelectedTenants((prevTenants) => {
      // Check if tenantId is already in the array
      if (prevTenants.includes(tenantId)) {
        // Remove the tenant if it's already selected
        return prevTenants.filter((id) => id !== tenantId);
      } else {
        // Add the tenant if it's not in the array
        return [...prevTenants, tenantId];
      }
    });

    // Ensure "Select All" is deselected
    setSelectAll(false);
  };

  const [TerminationListing, terminationProps] = useTerminationListingMutation();

  const [
    TenantRegenerateLease,
    {
      isLoading: isLoadingRegenerate,
      isSuccess: isSuccessRegenerate,
      isError: isErrorRegenerate,
      data: dataRegenerate,
      error: errorRegenerate,
    },
  ] = useTenantRegenerateLeaseMutation();

  const [bulkActionState, setBulkActionState] = useState({
    actions: [],
    selectedAction: 'All',
  });

  const [
    getTenantListing,
    {
      isLoading: isLoadingTenantListing,
      isError: isErrorTenantListing,
      isSuccess: isSuccessTenantListing,
      data: dataTenantListing,
      error: errorTenantListing,
    },
  ] = useGetTenantListingMutation();

  const summaryData = [
    {
      title: 'Total Notices',
      value: terminationProps?.data?.Summary.totalTeminations,
      subtitle: 'Current month',
      icon: <CheckCircle className="h-5 w-5 text-yellow-500" />,
      bgColor: 'bg-yellow-200',
    },
    {
      title: 'Confirmed Notices',
      value: terminationProps?.data?.Summary?.accepted,
      subtitle: 'Current month',
      icon: <FolderOpen className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-200',
    },
    {
      title: 'Notice Withdrawals',
      value: terminationProps?.data?.Summary.rejected,
      subtitle: 'Current Month',
      icon: <CheckCircle className="h-5 w-5 text-red-500" />,
      bgColor: 'bg-red-200',
    },
  ];

  const handleRegenerate = (terminationId) => {
    setPreviewFile(true);
    TenantRegenerateLease({
      body: {
        EntityName: 'Termination',
        RecordId: terminationId,
        RequestName: 'GenerateTerminationLetter',
      },
    });
  };

  const handleBulkRenew = async () => {
    if (selectedTenants.length < 1) {
      showErrorToast('Please select one or more records to renew');

      setBulkActionState((prev) => ({ ...prev, selectedAction: 'All' }));

      return;
    }
    // await renewTenant({
    //   body: {
    //     entityName: 'Tenant',
    //     requestName: 'RenewTenant',
    //     inputParamters: {
    //       Action: 'Bulk',
    //       TenantIds: selectedTenants,
    //     },
    //   },
    // });

    setBulkActionState((prev) => ({ ...prev, selectedAction: 'All' }));
  };

  useEffect(() => {
    if (bulkActionState.selectedAction === 'Auto Renewal') {
      handleBulkRenew();
    }
  }, [bulkActionState]);

  useEffect(() => {
    TerminationListing({
      body: {
        entityName: 'Facility',
        requestName: 'TerminationListing',
        inputParamters: {
          AccommodationProviderId: userDetails.supplierId,
          Filters: filters,
          Status: statusFilter,
          SearchText: searchText,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      },
    });
  }, [isSearch, pageNumber, bulkActionState, filters]);

  const totalRecords = dataTenantListing?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);

  if (isErrorRegenerate) {
    showErrorToast(errorRegenerate?.data);
  }

  const breadcrumbItems = [{ path: '/ap/terminations', label: 'Notices' }];
  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {terminationProps.isLoading && <PageLoder />}
      {terminationProps.isError && <ErrorPage message={terminationProps?.error.data} />}

      {terminationProps.isSuccess && (
        <div className=" mx-auto  space-y-6">
          {/* <FilterPopover
            filters={dataTenantListingAction?.ListingActionFilters}
            onApplyFilters={(values) => {
              const nonBulkActionFilters = dataTenantListingAction?.ListingActionFilters.filter((filter) => !filter.isBulkAction);
              const newArr = createNewFilterArray(nonBulkActionFilters, values);

              setFilters(newArr);
            }}
          /> */}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 pb-2">
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
                <span className="text-black"> Showing search results for </span> {searchText}
              </div>{' '}
              <X
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  setSearchText('');
                  setIsSearch(!isSearch);
                }}
              />{' '}
            </div>
          )}

          {/* All Tenants Section */}
          <Card className="rounded-md">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex">
                  <div className="mr-auto">
                    <h2 className="text-lg font-semibold">All Notices</h2>
                    <p className="text-sm text-gray-500">View and manage your property notices</p>
                  </div>
                  <div>
                    {/* <Button variant="default" type="button" onClick={handleExport}>
                      <Download /> Export
                    </Button> */}
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row  justify-between mb-6 gap-2">
                  <div className="flex flex-row gap-2 w-full md:w-1/3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search tenants"
                        className="pl-10 pr-8"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                      {searchText && (
                        <button
                          onClick={() => {
                            setSearchText('');
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
                  {/* <div className="flex flex-row gap-2">
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
                  </div> */}
                </div>

                {/* Table */}
                {terminationProps?.data?.Listing.length > 0 && (
                  <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>
                            <RadioGroupItem
                              value="all"
                              id="select-all"
                              checked={selectAll}
                              onClick={handleSelectAll}
                              className="w-5 h-5 rounded-md"
                            />
                          </TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead className="max-w-36">Lease Start Date</TableHead>
                          <TableHead className="max-w-36">Lease End Date</TableHead>
                          <TableHead className="max-w-36">Residence</TableHead>
                          <TableHead>Termination Date</TableHead>
                          <TableHead>Notice Month</TableHead>
                          {/* <TableHead>Status</TableHead> */}
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {terminationProps?.data.Listing.map((tenant, index) => (
                          <TableRow key={tenant.tenantId}>
                            <TableCell className="font-medium">
                              <RadioGroupItem
                                value={tenant.tenantId}
                                id={`tenant-${tenant.tenantId}`}
                                checked={selectedTenants.includes(tenant.tenantId)}
                                onClick={() => handleSelectTenant(tenant.tenantId)}
                                className="w-5 h-5 rounded-md"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{tenant.studentIdName}</TableCell>
                            <TableCell className="max-w-36">{tenant.startDate}</TableCell>
                            <TableCell className="max-w-36">{tenant.endDate}</TableCell>

                            <TableCell className="max-w-36">{tenant.facilityIdName}</TableCell>
                            <TableCell>{tenant.terminationDate}</TableCell>
                            <TableCell>{`${tenant.noticeMonth} ${tenant.noticeYear}`}</TableCell>
                            {/* <TableCell>
                                <Badge variant={getStatusBadgeClass(tenant.status)}>{tenant.status}</Badge>
                                
                            </TableCell> */}
                            <TableCell className="text-right">
                              <Button
                                onClick={() => handleRegenerate(tenant.terminationId)}
                                variant="outline"
                                size="sm"
                                className="border border-orange-500 text-orange-500 hover:text-orange-500"
                              >
                                View Notice
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </RadioGroup>
                )}

                {/* Pagination */}

                {/* Pagination */}
                {terminationProps?.data?.Listing.length > 0 && (
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
                {terminationProps.isSuccess && terminationProps?.data?.Listing.length < 1 && (
                  <EmptyState title="No terminations found" description="Create your first item to get started" icon={EmptyStateIcon} />
                )}
                {previewFile && isSuccessRegenerate && (
                  <FilePreviewModal
                    fileContent={dataRegenerate?.results}
                    fileName={'notice'}
                    fileExtension={'pdf'}
                    onClose={() => setPreviewFile(false)}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Terminations;
