// types/tenant.ts
export interface Tenant {
  tenantId: string;
  accomodationApplicationsId: string;
  studentIdName: string;
  facilityIdName: string;
  roomType: string;
  price: string;
  startDate: string;
  endDate: string;
  mobile: string;
  leaseStatus: string;
  studentSigned: boolean;
  apSigned: boolean;
  apSigningURL: string | null;
  roomNumber?: string;
}

export interface TenantSummary {
  pendingPropertyViewing: number;
  pendingSignature: number;
  active: number;
  notice: number;
  terminated: number;
}

export interface TenantListingResponse {
  Listing: Tenant[];
  Summary: TenantSummary;
  RecordCount: number;
}

export interface TenantFilter {
  PortalListingId: string;
  ActionFilterId: string;
}

export interface ActionFilter {
  portalListingFilterId: string;
  filterName: string;
  actions: {
    actionName: string;
    actionId: string;
  }[];
}

export interface ListingActionFilter {
  portalListingId: string;
  label: string;
  isBulkAction: boolean;
  actionFilters: ActionFilter[];
}

export interface ListingActionResponse {
  ListingActionFilters: ListingActionFilter[];
}

export interface BulkActionState {
  actions: {
    actionName: string;
    actionId: string;
  }[];
  selectedAction: string;
}

export interface TenantDetailsResponse {
  // Define structure based on your API response
  LeaseDetails: {
    apSigningURL: string | null;
    // Add other properties
  }[];
  // Add other properties
}
