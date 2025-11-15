// pages/Tenant.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/layouts/DashboardLayout';
import Breadcrumb from '@/components/BreadCrumb';
import PageLoder from '@/components/PageLoder';
import ErrorPage from '@/components/ErrorPage';
import EmptyState from '@/components/EmptyState';
import SuccessPage from '@/components/SuccessPage';
import EnhancedPagination from '@/components/EnhancedPagination';
import SignWellWindow from '@/components/SignWellWindow';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';

// Custom hooks
import { useTenantData } from '@/hooks/useTenantData';
import { useTenantActions } from '@/hooks/useTenantActions';

// Tenant components
import TenantHeader from './Components/TenantHeader';
import TenantSummary from './Components/TenantSummary';
import TenantTable from './Components/TenantTable';
import SearchNotification from './Components/SearchNotification';
import StudentProfileModal from './DetailsModal';
import TerminateModal from './Terminatemodal';
import FilterPopover from './Filter';

// Utils and types
import { createNewFilterArray } from '@/utils/helpers';
import { BulkActionState, TenantFilter } from '@/types/tenant';
import EzraSignModal from '@/components/SignWellWindow/EzraSignModal';

const Tenant = () => {
  // State for pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // State for search
  const [searchText, setSearchText] = useState('');
  const [isSearch, setIsSearch] = useState(false);

  // State for filters
  const [filters, setFilters] = useState<TenantFilter[]>([]);

  // State for tenant selection
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // State for modals
  const [showDetails, setShowDetails] = useState(false);
  const [isShowTerminateModal, setIsShowTerminateModal] = useState(false);
  const [showSignWellWindow, setShowSignWellWindow] = useState(false);

  // State for tenant details
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [tenantId, setTenantId] = useState('');
  const [signWellUrl, setSignWellUrl] = useState('');
  const [signwellAction, setSignwellAction] = useState('');

  // Bulk actions state
  const [bulkActionState, setBulkActionState] = useState<BulkActionState>({
    actions: [],
    selectedAction: 'All',
  });

  // Get tenant data and actions
  // Trigger data fetch when page, filters, or search changes
  const [shouldFetchData, setShouldFetchData] = useState(true);

  const { tenantListing, listingActions, isLoading, isError, error, totalPages } = useTenantData({
    pageNumber,
    pageSize,
    searchText: isSearch ? searchText : '',
    filters,
    shouldFetchData,
  });

  const {
    handleExport,
    handleViewDetails,
    handleViewLease,
    handleRenew,
    handleRegenerate,
    tenantDetailsData,
    tenantDetailsLoading,
    tenantDetailsSuccess,
    tenantDetailsError,
    tenantDetailsErrorData,
    exportLoading,
    renewLoading,
    regenerateLoading,
    regenerateSuccess,
    signWellLoading,
    signWellSuccess,
    signWellData,
    terminateLoading,
    terminateSuccess,
  } = useTenantActions();

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTenants([]);
    } else {
      const allTenantIds = tenantListing?.Listing.map((tenant) => tenant.tenantId) || [];
      setSelectedTenants(allTenantIds);
    }
    setSelectAll(!selectAll);
  };

  console.log('--', signWellSuccess, signWellData);
  useEffect(() => {
    if (signWellSuccess) {
      console.log('view lease');
      window.open(signWellData.url, '_blank');
    }
  }, [signWellSuccess]);

  // Handle individual selection
  const handleSelectTenant = (tenantId: string) => {
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

  // Handle bulk action change
  const handleBulkActionChange = (action: string) => {
    setBulkActionState((prev) => ({ ...prev, selectedAction: action }));

    if (action === 'Auto Renewal') {
      handleBulkRenew();
    }
  };

  // Handle bulk renew
  const handleBulkRenew = async () => {
    if (selectedTenants.length < 1) {
      return;
    }

    await handleRenew(selectedTenants);
    setBulkActionState((prev) => ({ ...prev, selectedAction: 'All' }));
  };

  // Handle search
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (!text) {
      setIsSearch(false);
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    setIsSearch(true);
    // Force a data refresh
    setShouldFetchData(false);
    setTimeout(() => setShouldFetchData(true), 0);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchText('');
    setIsSearch(false);
  };

  // Handle view details
  const handleTenantDetails = (tenantId: string, accomodationApplicationsId: string, apSigningURL: string | null) => {
    setSelectedTenant(accomodationApplicationsId);
    setTenantId(tenantId);
    setSignWellUrl(apSigningURL || '');
    setShowDetails(true);
    handleViewDetails(tenantId);
  };

  // Handle sign lease
  const handleSignLease = (url: string) => {
    setShowSignWellWindow(true);
    setSignWellUrl(url);
  };

  // Handle view lease
  const handleTenantViewLease = (accomodationApplicationsId: string) => {
    setSelectedTenant(accomodationApplicationsId);
    setSignwellAction('View Lease');
    handleViewLease(accomodationApplicationsId);
  };

  // Handle terminate
  const handleTenantTerminate = (tenantId: string) => {
    setTenantId(tenantId);
    setIsShowTerminateModal(true);
  };

  // Handle filter application
  const handleApplyFilters = (values: any) => {
    if (!listingActions?.ListingActionFilters) return;

    const nonBulkActionFilters = listingActions.ListingActionFilters.filter((filter) => !filter.isBulkAction);

    const newArr = createNewFilterArray(nonBulkActionFilters, values);
    setFilters(newArr);
  };

  // Update bulk actions when filter changes
  useEffect(() => {
    if (bulkActionState.selectedAction === 'Auto Renewal') {
      handleBulkRenew();
    }
  }, [bulkActionState.selectedAction]);

  // Set up breadcrumb
  const breadcrumbItems = [{ path: '/ap/tenants', label: 'Tenants' }];

  // Show success pages for completed actions
  if (regenerateSuccess) {
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

  if (terminateSuccess) {
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

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isLoading && <PageLoder />}
      {isError && <ErrorPage message={error?.data} />}

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
            window.location.reload();
          }}
          tenantId={tenantId}
        />
      )}

      {showDetails && (
        <StudentProfileModal
          open={showDetails}
          data={tenantDetailsData}
          isSuccess={tenantDetailsSuccess}
          isError={tenantDetailsError}
          error={tenantDetailsErrorData}
          isLoading={tenantDetailsLoading}
          isLoadingSignWell={signWellLoading}
          isLoadingAccomodation={false}
          isLoadingRegenerate={regenerateLoading}
          isLoadingTerminate={terminateLoading}
          onViewLease={(action) => {
            setSignwellAction(action);
            handleTenantViewLease(selectedTenant);
          }}
          onOpenChange={() => {
            setShowDetails(false);
            window.location.reload();
          }}
          onSignLease={() => {
            if (signWellUrl) {
              window.open(signWellUrl);
              setShowDetails(false);
              window.location.reload();
            }
          }}
          onTerminate={() => handleTenantTerminate(tenantId)}
          onRegenerate={() => handleRegenerate(tenantId)}
        />
      )}

      {tenantListing && (
        <div className="mx-auto space-y-6">
          <FilterPopover filters={listingActions?.ListingActionFilters} onApplyFilters={handleApplyFilters} />

          {/* Summary Cards */}
          {tenantListing.Summary && <TenantSummary summary={tenantListing.Summary} />}

          <SearchNotification searchText={searchText} onClear={handleSearchClear} isVisible={isSearch} />

          {/* All Tenants Section */}
          <Card className="rounded-md">
            <CardContent className="p-6">
              <div className="space-y-4">
                <TenantHeader
                  onSearchChange={handleSearchChange}
                  onSearchClick={handleSearchClick}
                  onExport={handleExport}
                  onApplyFilter={setFilters}
                  onBulkActionChange={handleBulkActionChange}
                  searchText={searchText}
                  bulkActionState={bulkActionState}
                  listingActionFilters={listingActions?.ListingActionFilters}
                  isLoadingExport={exportLoading}
                />

                {/* Table */}
                {tenantListing.Listing && tenantListing.Listing.length > 0 ? (
                  <>
                    <TenantTable
                      tenants={tenantListing.Listing}
                      onSelectTenant={handleSelectTenant}
                      onSelectAll={handleSelectAll}
                      onViewDetails={handleTenantDetails}
                      onViewLease={handleTenantViewLease}
                      onSignLease={handleSignLease}
                      onRenew={handleRenew}
                      onTerminate={handleTenantTerminate}
                      selectedTenants={selectedTenants}
                      selectAll={selectAll}
                      isLoadingRenew={renewLoading}
                    />

                    {/* Pagination */}
                    <div className="mt-4">
                      <EnhancedPagination currentPage={pageNumber} totalPages={totalPages} onPageChange={(page) => setPageNumber(page)} />
                    </div>
                  </>
                ) : (
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
