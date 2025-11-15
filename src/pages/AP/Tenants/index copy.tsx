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
import StudentProfileModal from './DetailsModal';
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

const Tenant = () => {
  const [statusFilter, setStatusFilter] = useState('');
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

  const [employee, { isLoading, isSuccess, isError, data, error }] = useEmployeeMutation();
  const [renewTenant, { isLoading: isLoadingRenew, isSuccess: isSuccessRenew, isError: isErrorRenew, error: errorRenew, data: dataRenew }] =
    useRenewTenantMutation();
  const [exportStudents, { isLoading: isLoadingExport, isSuccess: isSuccessExport, isError: isErrorExport, data: dataExport }] =
    useExportStudentsMutation();
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
  const [
    retrieveSignwellReq,
    { isLoading: isLoadingSignWell, isSuccess: isSuccessSignWell, isError: isErrorSignWell, data: dataSignWell },
  ] = useRetrieveSignwellReqMutation();
  const [
    TerminateTenantReq,
    { isLoading: isLoadingTerminate, isSuccess: isSuccessTerminate, isError: isErrorTerminate, data: dataTerminate },
  ] = useTerminateTenantReqMutation();

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
  const summaryData = [
    {
      title: 'Scheduled Viewings',
      value: tenantListing?.Summary?.pendingPropertyViewing,
      subtitle: 'Current month',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-200',
    },
    {
      title: 'Pending Signature',
      value: tenantListing?.Summary?.pendingSignature,
      subtitle: 'Current month',
      icon: <FolderOpen className="h-5 w-5 text-purple-500" />,
      bgColor: 'bg-purple-200',
    },
    {
      title: 'Active Tenants',
      value: tenantListing?.Summary?.active,
      subtitle: 'Current Month',
      icon: <CheckCircle className="h-5 w-5 text-yellow-500" />,
      bgColor: 'bg-yellow-200',
    },
    {
      title: 'On Notice',
      value: tenantListing?.Summary?.notice,
      subtitle: 'Current month',
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-200',
    },

    {
      title: 'Terminated',
      value: tenantListing?.Summary?.terminated,
      subtitle: 'Current month',
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      bgColor: 'bg-red-200',
    },
  ];

  const handleExport = () => {
    exportStudents({
      body: {
        entityName: 'Tenant',

        requestName: 'ExportInstitutionListing',

        inputParamters: {
          supplierId: userDetails.supplierId,
        },
      },
    });
  };

  const handleViewDetails = (recordId) => {
    setSelectedTenant(recordId);
    setShowDetails(true);
    employee({
      body: {
        entityName: 'Tenant',
        requestName: 'StudentDetailsReq',
        recordId: recordId,
        Inputparamters: {
          accomodationProviderId: userDetails.supplierId,
        },
      },
    });
  };

  const SignLease = async (action: string) => {
    if (data.LeaseDetails[0]?.apSigningURL === null) {
      showMessageToast(
        `Your lease is being prepared! You'll receive an email with the lease document shortly. You can also check back here in a few minutes to sign it.`
      );
      return;
    }
    window.open(signWellUrl);
    setSignwellAction(action);
    setShowDetails(false);
    window.location.reload();
  };
  const ViewLease = async (action: string) => {
    setShowSignWellWindow(false);
    setSignWellUrl('');
    setSignwellAction(action);

    retrieveSignwellReq({
      body: {
        entityName: 'AccomodationApplications',
        requestName: 'RetrieveSignwellReq',
        recordId: selectedTenant,
        inputParamters: {
          UserType: 'AP',
        },
      },
    });
  };

  const handleRenew = (tenantId) => {
    renewTenant({
      body: {
        entityName: 'Tenant',
        requestName: 'RenewTenant',
        inputParamters: {
          Action: 'Single',
          TenantIds: tenantId,
        },
      },
    });
  };

  const handleTerminate = (action) => {
    setIsShowTerminateModal(true);

    // TerminateTenantReq({
    //   body: {
    //     entityName: 'Tenant',
    //     requestName: 'TerminateTenantReq',
    //     recordId: tenantId,
    //   },
    // });
  };
  const handleRegenerate = () => {
    TenantRegenerateLease({
      body: {
        entityName: 'Tenant',
        requestName: 'RegenerateLeaseExecRequest',
        recordId: tenantId,
      },
    });
  };

  const handleBulkRenew = async () => {
    if (selectedTenants.length < 1) {
      showErrorToast('Please select one or more records to renew');

      setBulkActionState((prev) => ({ ...prev, selectedAction: 'All' }));

      return;
    }
    await renewTenant({
      body: {
        entityName: 'Tenant',
        requestName: 'RenewTenant',
        inputParamters: {
          Action: 'Bulk',
          TenantIds: selectedTenants,
        },
      },
    });

    setBulkActionState((prev) => ({ ...prev, selectedAction: 'All' }));
  };

  useEffect(() => {
    if (bulkActionState.selectedAction === 'Auto Renewal') {
      handleBulkRenew();
    }
  }, [bulkActionState]);

  useEffect(() => {
    if (isSuccessRenew && data?.isSuccess) {
      showSuccessToast(dataRenew?.clientMessage);
    }
  }, [isSuccessRenew]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await getTenantListing({
          body: {
            entityName: 'Tenant',
            requestName: 'TenantListingReq',
            inputParamters: {
              AccommodationProviderId: userDetails.supplierId,
              SearchText: searchText,
              PageNumber: pageNumber,
              PageSize: pageSize,
              Filters: filters,
            },
          },
        });

        setTenantListing(response.data);
      } catch (error) {
        console.error('Error fetching tenant listing:', error);
      }
    };

    fetchTenants();
  }, [isSearch, pageNumber, bulkActionState, filters]);

  useEffect(() => {
    getTenantListingAction({
      body: {
        entityName: 'PortalListing',
        requestName: 'GetListingActions',
        inputParamters: {
          UserId: userDetails.supplierId,
          UserType: 'Supplier',
          PageRoute: '/ap/tenants',
          PageName: 'Tenant Management',
        },
      },
    });
  }, []);

  const totalRecords = dataTenantListing?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);

  useEffect(() => {
    if (isSuccessExport) {
      downloadFile({ name: dataExport?.file[0]?.name, extension: 'xlsx', content: dataExport?.file[0]?.content });
    }
  }, [isSuccessExport]);

  useEffect(() => {
    if (!isSuccessSignWell) return;
    if (signwellAction === 'View Lease') {
      window.open(dataSignWell.url);
    }
  }, [isSuccessSignWell, dataSignWell, signwellAction]);

  if (isSuccessRenew && dataRenew.isRenewed === true) {
    showSuccessToast(dataRenew?.clientMessage);
  }
  if (isSuccessRenew && dataRenew.isRenewed === false) {
    showErrorToast(dataRenew?.clientMessage);
  }
  if (isErrorRenew) {
    showErrorToast(errorRenew?.data);
  }
  if (isErrorRegenerate) {
    showErrorToast(errorRegenerate?.data);
  }

  if (isSuccessRegenerate) {
    return (
      <SuccessPage
        description="A new lease has been regenerated, please go to view lease to view the latest lease."
        title="Lease regenerated successfully"
        secondaryAction={{
          label: 'Continue',
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  if (isSuccessTerminate) {
    return (
      <SuccessPage
        description="Tenant lease has been terminated. Please note tenant will be notified about your decision."
        title="Tenant terminated successfully"
        secondaryAction={{
          label: 'Continue',
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  const formatPhoneNumber = (number) => {
    return number.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const breadcrumbItems = [{ path: '/ap/tenants', label: 'Tenants' }];

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isLoadingTenantListing && <PageLoder />}
      {isErrorTenantListing && <ErrorPage message={errorTenantListing?.data} />}

      {showSignWellWindow && (
        // <EzraSignModal
        //   show={showSignWellWindow}
        //   url={signWellUrl}
        //   onClose={() => {
        //     setShowSignWellWindow(false);
        //     setSignWellUrl('');
        //     setSignwellAction('');
        //     window.location.reload();
        //   }}
        // />
        <SignWellWindow
          show={showSignWellWindow}
          url={signWellUrl}
          onClose={() => {
            setShowSignWellWindow(false);
            setSignWellUrl('');
            setSignwellAction('');
            window.location.reload();
          }}
        />
      )}
      {isShowTerminateModal && (
        <TerminateModal
          isOpen={isShowTerminateModal}
          onCancell={() => {
            setIsShowTerminateModal(false);
            // window.location.reload();
          }}
          tenantId={tenantId}
        />
      )}

      {isSuccessTenantListing && (
        <div className=" mx-auto  space-y-6">
          <FilterPopover
            filters={dataTenantListingAction?.ListingActionFilters}
            onApplyFilters={(values) => {
              const nonBulkActionFilters = dataTenantListingAction?.ListingActionFilters.filter((filter) => !filter.isBulkAction);
              const newArr = createNewFilterArray(nonBulkActionFilters, values);

              setFilters(newArr);
            }}
          />

          {showDetails && (
            <StudentProfileModal
              open={showDetails}
              data={data}
              isSuccess={isSuccess}
              isError={isError}
              error={error}
              isLoading={isLoading}
              isLoadingSignWell={isLoadingSignWell}
              isLoadingAccomodation={false}
              isLoadingRegenerate={isLoadingRegenerate}
              isLoadingTerminate={isLoadingTerminate}
              onViewLease={(action) => ViewLease(action)}
              onOpenChange={() => {
                setShowDetails(false);
                window.location.reload();
              }}
              onSignLease={(action) => SignLease(action)}
              onTerminate={(action) => handleTerminate(action)}
              onRegenerate={(action) => handleRegenerate(action)}
            />
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pb-2">
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
                    <h2 className="text-lg font-semibold">All Tenants</h2>
                    <p className="text-sm text-gray-500">View and manage your property tenants</p>
                  </div>
                  <div>
                    <Button variant="default" type="button" onClick={handleExport}>
                      <Download /> Export
                    </Button>
                  </div>
                </div>

                {isLoadingRenew || isLoadingTerminate || (isLoadingSignWell && <Spinner className="text-orange-500" />)}

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
                  <div className="flex flex-row gap-2">
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
                  </div>
                </div>

                {/* Table */}
                {tenantListing?.Listing.length > 0 && (
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
                          <TableHead className="max-w-36">Facility</TableHead>
                          {/* <TableHead>Room</TableHead> */}

                          <TableHead className="max-w-36">Room Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Contact No</TableHead>
                          <TableHead>Lease Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tenantListing?.Listing.map((tenant, index) => (
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
                            <TableCell className="max-w-36">{tenant.facilityIdName}</TableCell>
                            {/* <TableCell>{tenant.roomNumber}</TableCell> */}

                            <TableCell className="max-w-36">{tenant.roomType}</TableCell>
                            <TableCell>{tenant.price}</TableCell>
                            <TableCell>{tenant.startDate}</TableCell>
                            <TableCell>{tenant.endDate}</TableCell>
                            <TableCell>{formatPhoneNumber(tenant.mobile)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusBadgeClass(tenant.leaseStatus)}>{tenant.leaseStatus}</Badge>

                                {tenant.leaseStatus === 'Pending Signature' && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Eye
                                        className="h-4 w-4 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                        aria-label="View signing status"
                                      />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-0 shadow-lg border-gray-200" side="right" align="start">
                                      <div className="p-3 bg-orange-50 border-b border-orange-100">
                                        <h3 className="font-medium text-sm text-orange-800">Lease Signing Status</h3>
                                      </div>

                                      <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium">Student:</span>
                                          {tenant.studentSigned === true ? (
                                            <span className="text-green-600 flex items-center bg-green-50 px-2 py-1 rounded text-xs">
                                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                              Signed
                                            </span>
                                          ) : (
                                            <span className="text-red-500 flex items-center bg-red-50 px-2 py-1 rounded text-xs">
                                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                              Not signed
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium">Landlord:</span>
                                          {tenant.apSigned === true ? (
                                            <span className="text-green-600 flex items-center bg-green-50 px-2 py-1 rounded text-xs">
                                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                              Signed
                                            </span>
                                          ) : (
                                            <span className="text-red-500 flex items-center bg-red-50 px-2 py-1 rounded text-xs">
                                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                              Not signed
                                            </span>
                                          )}
                                        </div>

                                        {!tenant.studentSigned && !tenant.apSigned && (
                                          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                            <p>Waiting for Student to sign lease</p>
                                          </div>
                                        )}
                                        {tenant.studentSigned && !tenant.apSigned && (
                                          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                            <p>Waiting for Landlord to sign lease</p>
                                          </div>
                                        )}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
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
                                  {/* {offer.DocumentURL && ( */}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      handleViewDetails(tenant.tenantId);
                                      setSelectedTenant(tenant.accomodationApplicationsId);
                                      setTenantId(tenant.tenantId);
                                      setSignWellUrl(tenant.apSigningURL);
                                    }}
                                    className="flex items-center font-medium"
                                  >
                                    <View className="mr-2 h-4 w-4 " />
                                    View Details
                                  </DropdownMenuItem>
                                  {tenant.leaseStatus === 'Active' && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedTenant(tenant.accomodationApplicationsId);
                                        setTenantId(tenant.tenantId);
                                        setSignWellUrl(tenant.apSigningURL);
                                        ViewLease('View Lease');
                                      }}
                                      className="flex items-center font-medium"
                                    >
                                      <Eye className="mr-2 h-4 w-4 " />
                                      View Lease
                                    </DropdownMenuItem>
                                  )}
                                  {tenant.apSigningURL != null && tenant.leaseStatus != 'Active' && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setShowSignWellWindow(true);
                                        setSignWellUrl(tenant.apSigningURL);
                                      }}
                                      className={`flex items-center font-medium   cursor-pointer`}
                                    >
                                      <Signature className={`mr-2 h-4 w-4 `} />
                                      Sign Lease
                                    </DropdownMenuItem>
                                  )}
                                  {/* {tenant.leaseStatus === 'Terminated'&& <DropdownMenuItem onClick={() => handleRenew(tenant.tenantId)} className={`flex items-center font-medium `}>
                                    <Recycle className="mr-2 h-4 w-4 text-purple-500" />
                                    {isLoadingRenew ? <Spinner /> : 'Renew Lease'}
                                  </DropdownMenuItem>} */}
                                  <DropdownMenuSeparator />

                                  {tenant.leaseStatus != 'Terminated' && tenant.leaseStatus != 'Active' && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedTenant(tenant.accomodationApplicationsId);
                                        setTenantId(tenant.tenantId);
                                        setIsShowTerminateModal(true);
                                      }}
                                      className="flex font-medium bg-red-500 text-white cursor-pointer"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4 text-white" />
                                      Terminate
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </RadioGroup>
                )}

                {/* Pagination */}

                {/* Pagination */}
                {tenantListing?.Listing.length > 0 && (
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
                {isSuccessTenantListing && tenantListing?.Listing.length < 1 && (
                  <EmptyState title="No tenants found" description="Create your first item to get started" icon={EmptyStateIcon} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Tenant;
