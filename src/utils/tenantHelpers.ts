// utils/tenantHelpers.ts
import { ListingActionFilter, TenantFilter } from '@/types/tenant';

/**
 * Format a phone number to add spaces
 * @param number Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (number: string): string => {
  return number.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
};

/**
 * Get CSS classes for a status badge based on status value
 * @param status Lease status string
 * @returns Badge variant class name
 */
export const getLeaseStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Pending Signature':
      return 'warning';
    case 'Terminated':
      return 'destructive';
    case 'On Notice':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Check if a lease needs admin signature
 * @param studentSigned Whether student has signed
 * @param adminSigned Whether admin has signed
 * @returns Boolean indicating if admin signature is needed
 */
export const needsAdminSignature = (studentSigned: boolean, adminSigned: boolean): boolean => {
  return studentSigned && !adminSigned;
};

/**
 * Create filters array from filter definitions and selected values
 * @param filterDefinitions Array of filter definitions
 * @param selectedValues Object with selected filter values
 * @returns Array of tenant filters
 */
export const createTenantFilters = (filterDefinitions: ListingActionFilter[], selectedValues: Record<string, string>): TenantFilter[] => {
  const result: TenantFilter[] = [];

  for (const definition of filterDefinitions) {
    for (const filter of definition.actionFilters) {
      if (selectedValues[definition.portalListingId] === filter.filterName) {
        result.push({
          PortalListingId: definition.portalListingId,
          ActionFilterId: filter.portalListingFilterId,
        });
      }
    }
  }

  return result;
};
