import { clearAuthData } from '@/slices/authSlice';
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Accessibility,
  Sofa,
  Users,
  PlugZap,
  UtensilsCrossed,
  Wifi,
  Dumbbell,
  Bed,
  Footprints,
  Bus,
  Coffee,
  Tv,
  Bath,
  Warehouse,
  KeyRound,
  Laptop,
} from 'lucide-react';

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

export const cleanAddressString = (...parts: (string | undefined)[]): string => {
  return parts
    .filter((part) => part !== '') // Filter out undefined and empty strings
    .join(' '); // Join remaining parts with a space
};

function* getIdGenerator() {
  let i = 0;
  while (true) {
    yield i++;
  }
}

const ids = getIdGenerator();

export const getId = (): number => ids.next().value || 0;

export const extractBase64FromDataUrl = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

export enum DocumentType {
  selfie = '591',
  roomPicture = '1055',
}

export const getDatesFromNextMonth = (dates: { value: string; label: string; code: string }[]) => {
  const currentDate = new Date();
  const nextMonth = currentDate.getMonth() + 2; // getMonth() is zero-indexed
  const nextYear = currentDate.getFullYear();

  return dates.filter(({ code }) => {
    const [day, month, year] = code.split('-').map(Number);
    return year > nextYear || (year === nextYear && month >= nextMonth);
  });
};

export const getDatesFromJuly2024 = (dates: { value: string; label: string; code: string }[]) => {
  const targetMonth = 7; // July
  const targetYear = 2024;

  return dates.filter(({ code }) => {
    const [day, month, year] = code.split('-').map(Number);
    return year > targetYear || (year === targetYear && month >= targetMonth);
  });
};

// export const getInitials = (data: { name?: string | null; firstName?: string | null; lastName?: string | null }): string => {
//   // Helper function to extract initials from a given string
//   const extractInitials = (str: string | null): string => {
//     if (!str) return '';
//     return str
//       .split(' ')
//       .map((word) => word.charAt(0))
//       .join('')
//       .toUpperCase();
//   };

//   // Use `name` if available, otherwise use `firstName` and `lastName`
//   if (data.name) {
//     return extractInitials(data.name);
//   }

//   const firstInitial = extractInitials(data.firstName);
//   const lastInitial = extractInitials(data.lastName);

//   return (firstInitial + lastInitial).toUpperCase();
// };

export const getInitials = (data: { name?: string | null; firstName?: string | null; lastName?: string | null }): string => {
  // Helper function to extract initials from a given string
  const extractInitials = (str: string | null): string => {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Use `name` if available, otherwise use `firstName` and `lastName`
  let initials = data.name ? extractInitials(data.name) : extractInitials(data.firstName) + extractInitials(data.lastName);

  // Limit to maximum 3 characters
  return initials.slice(0, 3).toUpperCase();
};

//Possible options
//default,success,error,pending,purple,yellow,secondary,destructive,outline,
export const getStatusBadgeClass = (status) => {
  const statusMap = {
    'pending approval': 'pending',
    accepted: 'success',
    pendingapproval: 'pending',
    applicationinprogress: 'pending',
    'pending grading': 'pending',
    'pending institution review': 'pending',
    'pending nsfas approval': 'pending',
    'pending signature': 'pending',
    'pending verification': 'pending',
    approved: 'success',
    verified: 'success',
    'grade a': 'success',
    'released': 'success',
    'grade b': 'yellow',
    'grade c': 'blue',
    'grade d': 'purple',
    awaitingacademiceligibilitycheck: 'purple',
    unverified: 'error',
    'not yet registerd for 2025': 'error',
    registrationreceived: 'blue',
    invite: 'blue',
    transport: 'blue',
    'not yet registered for 2025': 'blue',
    'awaiting checkin': 'blue',
    'pending acceptance': 'blue',
    allowed: 'success',
    disallowed: 'error',
    lapsed: 'error',
    cancelled: 'error',
    rejected: 'error',
    'funding not found': 'error',
    funded: 'success',
    success: 'success',
    declined: 'error',
    revoked: 'yellow',
    terminated: 'error',
    default: 'default',
    new: 'blue',
    'in progress': 'yellow',
    resolved: 'success',
    active: 'success',
    pending: 'blue',
    'on hold': 'purple',
    'pending payment': 'yellow',
    draft: 'purple',
    'pending move-in': 'yellow',
    'pending renewal': 'purple',
    provisionallyfunded: 'success',
    issued: 'success',
    processed: 'blue',
    paid: 'pending',
  };
  return statusMap[status?.toLowerCase()] || statusMap.default;
};

export const getAmenityIcon = (amenityName) => {
  const iconMap = {
    Bed: Bed,
    Bathroom: Bath,
    TV: Tv,
    'Study Desk': Laptop,
    'Hub/IT Room': Laptop,
    'WIFI - Internet Connectivity': Wifi,
    WIFI: Wifi,
    Storage: Warehouse,
    Kitchen: UtensilsCrossed,
    'Common Room': Users,
    Laundry: Bath,
    Security: KeyRound,
    Parking: Bus,
    Cafeteria: Coffee,
    Gym: Dumbbell,
    'Laundry Rooms': Dumbbell,
    'Utility Area': Sofa,
    'Student Study Area': Dumbbell,
    'Back Up Generator': PlugZap,
    // Add more mappings as needed
    default: Footprints,
  };

  // Convert amenity name to lowercase and remove spaces for matching
  const normalizedName = amenityName.toLowerCase().replace(/\s+/g, '');
  const matchedIcon = Object.entries(iconMap).find(([key]) => normalizedName.includes(key.toLowerCase()));

  return matchedIcon ? matchedIcon[1] : iconMap.default;
};

export const handleLogOut = () => {};

/**
 * Maps filter IDs to their corresponding label and action information
 * @param {Array} inputFilters - Array of filter objects with ActionFilterId and PortalListingId
 * @param {Array} filtersData - Array of filter data from the original file
 * @returns {Array} - Array of mapped filters in the format [{label: string, action: string}]
 */
export const mapFilters = (inputFilters, filtersData) => {
  return inputFilters
    .map((inputFilter) => {
      // Find the portal listing that matches the PortalListingId
      const portalListing = filtersData?.find((item) => item.portalListingId === inputFilter.PortalListingId);

      if (!portalListing) return null;

      // Find the action filter that matches the ActionFilterId
      const actionFilter = portalListing.actionFilters.find((filter) => filter.portalListingFilterId === inputFilter.ActionFilterId);

      if (!actionFilter) return null;

      // Return the mapped data in the desired format
      return {
        label: portalListing.label,
        action: actionFilter.filterName,
      };
    })
    .filter((item) => item !== null); // Remove any nulls (items that weren't found)
};

/**
 * Adds or updates a filter object in the filters array by looking at portalListingId
 * For use with React useState hooks
 *
 * @param {Object} newFilter - The filter object to add or update (must contain PortalListingId)
 * @param {Function} setFilters - The state setter function from useState
 */
export const addOrUpdateFilter = (newFilter, setFilters) => {
  // Validate that newFilter has the required PortalListingId
  if (!newFilter.PortalListingId) {
    throw new Error('newFilter must contain a PortalListingId');
  }

  // Update the filters using the setState functional update pattern
  setFilters((prevFilters) => {
    const existingIndex = prevFilters.findIndex((filter) => filter.PortalListingId === newFilter.PortalListingId);

    if (existingIndex !== -1) {
      // Update existing filter
      const updatedFilters = [...prevFilters];
      updatedFilters[existingIndex] = {
        ...updatedFilters[existingIndex],
        ...newFilter,
      };
      return updatedFilters;
    } else {
      // Add new filter
      return [...prevFilters, newFilter];
    }
  });
};

/**
 * Finds and returns the name of a bulk action filter if it exists in the user's filters
 *
 * @param {Array} userFilters - Array of user's selected filters with ActionFilterId and PortalListingId
 * @param {Array} filtersData - Array of filter data from the original file
 * @returns {String} - The name of the matched bulk action filter or empty string if none found
 */
export const findBulkActionFilterName = (userFilters, filtersData) => {
  // First find all portal listings with isBulkAction: true
  const bulkActionPortalListings = filtersData?.filter((item) => item.isBulkAction === true);

  // Check if any of the user's filters match a bulk action portal listing
  for (const userFilter of userFilters) {
    const matchingBulkListing = bulkActionPortalListings?.find((bulkItem) => bulkItem.portalListingId === userFilter.PortalListingId);

    if (matchingBulkListing) {
      // Now check if the ActionFilterId exists in the matching bulk listing's actionFilters
      const matchingActionFilter = matchingBulkListing.actionFilters.find(
        (actionFilter) => actionFilter.portalListingFilterId === userFilter.ActionFilterId
      );

      if (matchingActionFilter) {
        // Return the name of the matched filter
        return matchingActionFilter.filterName;
      }
    }
  }

  // If no match was found, return an empty string
  return '';
};

// Example usage:
/*
// Define your filters array
const filters = [
  { 
    "ActionFilterId": "82e58561-b9bb-44a9-8d70-4433b18a6a5d", 
    "PortalListingId": "c9c8a207-567f-431b-aec0-e6015c4aa1a1" 
  },
  { 
    "ActionFilterId": "33337f33-82e3-4714-b8a3-bc4778c524ec", 
    "PortalListingId": "5562a40b-28fe-4f1a-9603-9e9005ca9441" 
  }
];

// Load your filters data (this would typically come from an API or file)
const filtersData = [...]; // Your filters data from the file

// Get the name of any bulk action filter in the user's selections
const bulkActionName = findBulkActionFilterName(filters, filtersData);
console.log(bulkActionName); // Will return the filter name or empty string
*/

/**
 * Converts an object with {label, action} format to {ActionFilterId, PortalListingId} format
 *
 * @param {Object} labelActionObj - Object with label and action properties
 * @param {Array} filtersData - Array of filter data from the file
 * @returns {Object|null} - Object with ActionFilterId and PortalListingId or null if not found
 */
export const convertToFilterObject = (labelActionObj, filtersData) => {
  const { label, action } = labelActionObj;

  // Find the portal listing that matches the label
  const portalListing = filtersData.find((item) => item.label === label);

  if (!portalListing) {
    return null; // Label not found
  }

  // Find the action filter that matches the action name
  const actionFilter = portalListing.actionFilters.find((filter) => filter.filterName === action);

  if (!actionFilter) {
    return null; // Action not found
  }

  // Return in the required format
  return {
    ActionFilterId: actionFilter.portalListingFilterId,
    PortalListingId: portalListing.portalListingId,
  };
};

// Example usage:
/*
// Your input object
const labelAction = {
  label: 'Month', 
  action: 'March'
};

// Your filters data
const filtersData = [...]; // Your filters data from the file

// Convert to the required format
const filterObject = convertToFilterObject(labelAction, filtersData);
console.log(filterObject);
// Output would be:
// {
//   "ActionFilterId": "33337f33-82e3-4714-b8a3-bc4778c524ec",
//   "PortalListingId": "5562a40b-28fe-4f1a-9603-9e9005ca9441"
// }
*/

/**
 * Deletes a filter object from the filters array by its portalListingId
 * For use with React useState hooks
 *
 * @param {String} portalListingId - The PortalListingId of the filter to delete
 * @param {Function} setFilters - The state setter function from useState
 */
export const deleteFilter = (portalListingId, setFilters) => {
  // Validate that portalListingId is provided
  if (!portalListingId) {
    throw new Error('portalListingId must be provided');
  }

  // Update the filters using the setState functional update pattern
  setFilters((prevFilters) => {
    // Create a new array without the filter that matches the portalListingId
    const updatedFilters = prevFilters.filter((filter) => filter.PortalListingId !== portalListingId);

    return updatedFilters;
  });
};
