// hooks/useTenantData.ts
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetTenantListingMutation, useGetTenantListingActionMutation } from '@/services/apiService';
import { TenantListingResponse, TenantFilter } from '@/types/tenant';

interface UseTenantDataParams {
  pageNumber: number;
  pageSize: number;
  searchText: string;
  filters: TenantFilter[];
  shouldFetchData?: boolean;
}

export const useTenantData = ({ pageNumber, pageSize, searchText, filters, shouldFetchData = true }: UseTenantDataParams) => {
  const [tenantListing, setTenantListing] = useState<TenantListingResponse | null>(null);
  const userDetails = useSelector((state: RootState) => state.details.requestResults);

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

  // Fetch tenant listing
  useEffect(() => {
    if (!shouldFetchData) return;

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

        if (response.data) {
          setTenantListing(response.data);
        }
      } catch (error) {
        console.error('Error fetching tenant listing:', error);
      }
    };

    fetchTenants();
  }, [pageNumber, pageSize, searchText, filters, shouldFetchData]);

  // Fetch listing actions
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

  const totalPages = dataTenantListing?.RecordCount ? Math.ceil(dataTenantListing.RecordCount / pageSize) : 0;

  return {
    tenantListing: dataTenantListing || null,
    listingActions: dataTenantListingAction || null,
    isLoading: isLoadingTenantListing,
    isError: isErrorTenantListing,
    error: errorTenantListing,
    isSuccess: isSuccessTenantListing,
    isLoadingActions: isLoadingTenantListingAction,
    isSuccessActions: isSuccessTenantListingAction,
    totalPages,
  };
};
