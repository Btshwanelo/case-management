import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { RootState } from '@/store';
import { setAccommodationData } from '@/slices/accommodationSlice';
import {
  useBulkApplicationRejectReqMutation,
  useGetListingActionsMutation,
  useGetStudentApplicationsMutation,
} from '@/services/apiService';
import DashboardLayout from '@/layouts/DashboardLayout';
import FilterPopover from './Components/Filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicationSummaryCards } from './Components/ApplicationSummaryCards ';
import { ApplicationsTable } from './Components/ApplicationsTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PageLoder from '@/components/PageLoder';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';

import { ButtonLoader } from '@/components/ui/button-loader';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import { Spinner } from '@/components/ui/spinner';
import Breadcrumb from '@/components/BreadCrumb';
import ErrorPage from '@/components/ErrorPage';
import EmptyState from '@/components/EmptyState';
import EnhancedPagination from '@/components/EnhancedPagination';
import { setApplication } from '@/slices/reserveApplication';

const ResidenceApplications = () => {
  // State Management
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [filters, setFilters] = useState([]);
  const [loaderType, setLoaderType] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [bulkActionState, setBulkActionState] = useState({
    actions: [],
    selectedAction: 'All',
  });

  const [selectedState, setSelectedState] = useState({
    tenants: [],
    selectAll: false,
    selectedValue: '',
  });

  const [searchState, setSearchState] = useState({
    searchText: '',
    isSearch: false,
    pageNumber: 1,
    pageSize: 12,
  });

  // Hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  const [
    bulkApplicationRejectReq,
    { isLoading: isLaodingBulk, isSuccess: isSuccesBulk, data: dataBulk, isError: isErrorBulk, error: errorBulk },
  ] = useBulkApplicationRejectReqMutation();

  const handleBulkReject = async () => {
    if (selectedState.tenants.length < 1) {
      showErrorToast('Please select one or more records to reject');

      setBulkActionState((prev) => ({ ...prev, selectedAction: 'All' }));

      return;
    }
    await bulkApplicationRejectReq({
      body: {
        requestName: 'BulkApplicationRejectReq',
        inputParamters: {
          action: 'Bulk',
          accommodationApplicationIds: selectedState.tenants,
        },
      },
    });

    setBulkActionState((prev) => ({ ...prev, selectedAction: 'All' }));
  };
  const handleSignleRejectReject = (id) => {
    bulkApplicationRejectReq({
      body: {
        requestName: 'BulkApplicationRejectReq',
        inputParamters: {
          action: 'Single',
          accommodationApplicationIds: id,
        },
      },
    });
  };
  // API Mutations
  const [
    getStudentApplications,
    {
      data: applications,
      isSuccess: isSuccessApplications,
      isLoading: isLoadingApplications,
      isError: isErrorApplications,
      error: errorApplications,
    },
  ] = useGetStudentApplicationsMutation();

  const [getListingActions, { data: Listing, isErrorListing }] = useGetListingActionsMutation();

  // Handlers
  const handleSelectAll = () => {
    const newSelectAll = !selectedState.selectAll;
    setSelectedState({
      tenants: newSelectAll ? applications?.Listing.map((tenant) => tenant.accomodationApplicationsId) : [],
      selectAll: newSelectAll,
      selectedValue: newSelectAll ? 'All' : '',
    });
  };

  const handleSelectTenant = (tenantId, maxSelections = 100) => {
    const isSelected = selectedState.tenants.includes(tenantId);

    if (isSelected) {
      setSelectedState({
        ...selectedState,
        selectedValue: '',
        tenants: selectedState.tenants.filter((id) => id !== tenantId),
        selectAll: false,
      });
    } else if (selectedState.tenants.length < maxSelections) {
      setSelectedState({
        ...selectedState,
        selectedValue: tenantId,
        tenants: [...selectedState.tenants, tenantId],
        selectAll: false,
      });
    }
  };

  const handleViewApplication = (application) => {
    navigate(`/ap/accomodation-applications/${application.accomodationApplicationsId}`);

    dispatch(setAccommodationData(application));
    dispatch(setApplication(application));
  };

  const handleSearch = (value) => {
    setSearchState((prev) => ({ ...prev, searchText: value }));
  };
  const totalRecords = applications?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);

  // Effects
  useEffect(() => {
    getStudentApplications({
      body: {
        entityName: 'Facility',
        requestName: 'AccommodationListingReq',
        inputParamters: {
          AccommodationProviderId: userDetails.supplierId,
          Filters: filters,
          SearchText: searchTerm,
          PageNumber: pageNumber,
          PageSize: pageSize,
          Status: statusFilter,
        },
      },
    });
  }, [isSearch, pageNumber, bulkActionState, filters]);

  useEffect(() => {
    getListingActions({
      body: {
        entityName: 'PortalListing',
        requestName: 'GetListingActions',
        inputParamters: {
          UserId: userDetails.supplierId,
          UserType: 'Supplier',
          PageRoute: '/residences',
          PageName: 'Accommodation Applications',
        },
      },
    });
  }, []);

  useEffect(() => {
    if (bulkActionState.selectedAction === 'Bulk Reject') {
      handleBulkReject();
    }
  }, [bulkActionState]);

  const createNewFilterArray = (array1, array2) => {
    return array2.map((filter) => {
      // Find the corresponding item in array1
      const relatedItem = array1.find((item) =>
        item.actionFilters.some((actionFilter) => actionFilter.portalListingFilterId === filter.portalListingFilterId)
      );

      return {
        PortalListingId: relatedItem ? relatedItem.portalListingId : '',
        ActionFilterId: filter.portalListingFilterId,
      };
    });
  };

  if (isSuccesBulk && dataBulk.isRejected === true) {
    showSuccessToast(dataBulk?.clientMessage);
  }
  if (isSuccesBulk && dataBulk.isRejected === false) {
    showErrorToast(dataBulk?.clientMessage);
  }
  if (isErrorBulk) {
    showErrorToast(errorBulk?.data);
  }
  const breadcrumbItems = [{ path: '/residences', label: 'Applications' }];
  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isLoadingApplications && <PageLoder />}
      {isErrorApplications && <ErrorPage message={errorApplications.data} />}

      {isSuccessApplications && (
        <div className=" space-y-6">
          <FilterPopover
            filters={Listing?.ListingActionFilters}
            onApplyFilters={(values) => {
              const nonBulkActionFilters = Listing?.ListingActionFilters.filter((filter) => !filter.isBulkAction);
              const newArr = createNewFilterArray(nonBulkActionFilters, values);

              setFilters(newArr);
            }}
          />

          <ApplicationSummaryCards summary={applications?.Summary} />

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

          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>View and manage applications</CardDescription>
              {isLaodingBulk && <Spinner className="text-orange-500" />}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row  justify-between mb-6 gap-2">
                {/* Search Section */}
                <div className="flex flex-row gap-2 w-full md:w-1/3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search applications..."
                      className="pl-10 pr-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setLoaderType('search');
                          setIsSearch(!isSearch);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => {
                      setLoaderType('search');
                      setIsSearch(!isSearch);
                    }}
                  >
                    {isLoadingApplications && loaderType === 'search' ? (
                      <ButtonLoader size="large" />
                    ) : (
                      <Search className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-row gap-2">
                  {Listing?.ListingActionFilters.map(
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
                </div>
              </div>

              <ApplicationsTable
                applications={applications?.Listing}
                selectedValue={selectedState.selectedValue}
                selectedTenants={selectedState.tenants}
                selectAll={selectedState.selectAll}
                onSelectAll={handleSelectAll}
                onSelectTenant={handleSelectTenant}
                onViewApplication={handleViewApplication}
                handleSignleRejectReject={(id) => handleSignleRejectReject(id)}
              />

              {applications?.Listing.length > 0 && (
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
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ResidenceApplications;
